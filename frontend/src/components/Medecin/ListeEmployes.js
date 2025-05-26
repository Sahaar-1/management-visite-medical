import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Alert, Badge,  Spinner } from 'react-bootstrap';
import api from '../../utils/axiosConfig';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaHistory, FaEnvelope } from 'react-icons/fa';
import './ListeEmployes.css';

const ListeEmployes = () => {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [consultationData, setConsultationData] = useState({
    statut: 'FAITE',
    aptitudeGenerale: 'APTE', // Aptitude générale (APTE ou INAPTE)
    hc: 'APTE', // Hors Classe (APTE ou INAPTE)
    th: 'APTE', // Travailleur Handicapé (APTE ou INAPTE)
    cir: 'APTE', // Contre-Indication Relative (APTE ou INAPTE)
    classe: '1',
    observations: ''
  });
  const [consultationsTerminees, setConsultationsTerminees] = useState([]);
  const [showEnvoyerModal, setShowEnvoyerModal] = useState(false);
  const [consultationsAEnvoyer, setConsultationsAEnvoyer] = useState([]);
  const [envoyerLoading, setEnvoyerLoading] = useState(false);
  const [statsConsultations, setStatsConsultations] = useState({
    faites: 0,
    nonFaites: 0,
    total: 0
  });

  // Fonction pour récupérer toutes les consultations du jour
  const fetchConsultations = useCallback(async (employesList = null) => {
    try {
      // Récupérer les consultations pour aujourd'hui (tous statuts)
      const today = new Date().toISOString().split('T')[0];

      // Utiliser l'endpoint qui filtre uniquement par date, sans filtrer par statut
      const response = await api.get(`/consultations?date=${today}`);

      console.log('Consultations récupérées du serveur:', response.data);
      setConsultationsTerminees(response.data);

      // Mettre à jour le statut des employés en fonction des consultations
      if (employesList && Array.isArray(employesList) && employesList.length > 0 && Array.isArray(response.data)) {
        const updatedEmployes = employesList.map(emp => {
          const consultation = response.data.find(c => {
            // Gérer différentes structures de données pour employeId
            if (c.employeId && typeof c.employeId === 'object' && c.employeId._id) {
              return c.employeId._id === emp._id;
            }
            if (c.employeId && typeof c.employeId === 'string') {
              return c.employeId === emp._id;
            }
            return false;
          });

          if (consultation) {
            console.log(`Consultation trouvée pour ${emp.nom}: ${consultation.statut}`);
            return {
              ...emp,
              consultationStatus: consultation.statut,
              consultationEffectuee: true, // Marquer comme effectuée pour désactiver le bouton
              statutVisite: consultation.statut, // IMPORTANT: Ajouter le statut de visite
              consultationId: consultation._id // IMPORTANT: Ajouter l'ID de consultation
            };
          }
          return emp;
        });

        console.log('Employés mis à jour avec consultations:', updatedEmployes);
        setEmployes(updatedEmployes);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des consultations:", error);
      setError("Impossible de récupérer les consultations du jour");
    }
  }, []); // Supprimer la dépendance employes pour éviter la boucle infinie

  // Fonction pour récupérer les employés avec rendez-vous du jour
  const fetchEmployes = useCallback(async () => {
    try {
      setLoading(true);

      // Récupérer les rendez-vous du jour
      const response = await api.get('/rendez-vous/jour');

      // Si aucun rendez-vous n'est trouvé, afficher un message
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        setEmployes([]);
        setConsultationsTerminees([]);
        return;
      }

      // Utiliser directement les données formatées renvoyées par l'API
      setEmployes(response.data);

      // Récupérer toutes les consultations du jour en passant la liste des employés
      await fetchConsultations(response.data);

    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
      setEmployes([]);
      setConsultationsTerminees([]);
    } finally {
      setLoading(false);
    }
  }, [fetchConsultations]);

  useEffect(() => {
    fetchEmployes();
  }, [fetchEmployes]);

  // Surveiller les changements de consultationsTerminees pour debug uniquement
  useEffect(() => {
    console.log('Consultations terminées mises à jour:', {
      total: consultationsTerminees.length,
      nonEnvoyees: consultationsTerminees.filter(c => !c.envoyeAdmin).length,
      details: consultationsTerminees.map(c => ({
        id: c._id,
        employe: c.employeId?.nom || c.employeId,
        statut: c.statut,
        envoyeAdmin: c.envoyeAdmin
      }))
    });
  }, [consultationsTerminees]);

  // Fonction pour vérifier si une consultation existe déjà
  const verifierConsultationExistante = (employeId) => {
    // Priorité 1: Vérifier dans le state local des employés (plus fiable)
    const employeAvecConsultation = employes.find(emp =>
      emp._id === employeId && (emp.consultationEffectuee === true || emp.consultationId)
    );

    if (employeAvecConsultation) {
      console.log('Consultation trouvée dans state local pour employé:', employeId);
      return true;
    }

    // Priorité 2: Vérifier dans les consultations terminées
    if (Array.isArray(consultationsTerminees) && consultationsTerminees.length > 0) {
      const consultationExistante = consultationsTerminees.some(consultation => {
        // Gérer différentes structures d'employeId
        let consultationEmployeId = null;

        if (consultation.employeId && typeof consultation.employeId === 'object' && consultation.employeId._id) {
          consultationEmployeId = consultation.employeId._id;
        } else if (consultation.employeId && typeof consultation.employeId === 'string') {
          consultationEmployeId = consultation.employeId;
        }

        // Vérifier que c'est le bon employé et que c'est pour aujourd'hui
        const isToday = new Date(consultation.dateConsultation).toDateString() === new Date().toDateString();
        const isCorrectEmployee = consultationEmployeId === employeId;

        if (isCorrectEmployee && isToday) {
          console.log('Consultation trouvée dans consultationsTerminees pour employé:', employeId);
          return true;
        }
        return false;
      });

      if (consultationExistante) {
        return true;
      }
    }

    return false;
  };

  // Fonction pour ouvrir le modal de consultation
  const handleConsultation = (employe) => {
    // Vérifier si une consultation existe déjà
    if (verifierConsultationExistante(employe._id)) {
      setError(`Une consultation a déjà été enregistrée pour ${employe.prenom} ${employe.nom} aujourd'hui`);

      // Effacer le message d'erreur après 3 secondes
      setTimeout(() => {
        setError(null);
      }, 3000);

      return;
    }

    setSelectedEmploye(employe);
    setConsultationData({
      statut: 'FAITE', // Statut par défaut
      aptitudeGenerale: 'APTE',
      hc: 'APTE',
      th: 'APTE',
      cir: 'APTE',
      classe: '1',
      observations: ''
    });
    setShowConsultationModal(true);
  };

  // Fonction pour gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si c'est un checkbox, utiliser la valeur "checked", sinon utiliser "value"
    const inputValue = type === 'checkbox' ? checked : value;

    setConsultationData({
      ...consultationData,
      [name]: inputValue
    });
  };

  // Fonction pour enregistrer la consultation
  const saveConsultation = async () => {
    try {
      // Vérifier à nouveau avant l'enregistrement
      if (verifierConsultationExistante(selectedEmploye._id)) {
        setError(`Une consultation a déjà été enregistrée pour ${selectedEmploye.prenom} ${selectedEmploye.nom} aujourd'hui`);
        setShowConsultationModal(false);

        // Effacer le message d'erreur après 3 secondes
        setTimeout(() => {
          setError(null);
        }, 3000);

        return;
      }

      // Validation des données du formulaire selon le statut
      if (consultationData.statut === 'FAITE') {
        if (!consultationData.aptitudeGenerale) {
          setError("Veuillez sélectionner une aptitude générale");
          return;
        }

        if (!consultationData.classe || isNaN(parseInt(consultationData.classe)) ||
            parseInt(consultationData.classe) < 0 || parseInt(consultationData.classe) > 10) {
          setError("La classe doit être un nombre entre 0 et 10");
          return;
        }
      }

      // Récupérer l'ID du médecin connecté
      const userResponse = await api.get('/auth/profil');
      const medecinId = userResponse.data._id;

      // S'assurer que toutes les propriétés requises sont présentes
      if (!selectedEmploye._id) {
        setError("ID de l'employé manquant");
        return;
      }

      if (!selectedEmploye.rendezVousId) {
        setError("ID du rendez-vous manquant");
        return;
      }

      if (!medecinId) {
        setError("ID du médecin manquant");
        return;
      }

      // Créer la consultation
      const consultationPayload = {
        rendezVousId: selectedEmploye.rendezVousId,
        employeId: selectedEmploye._id,
        statut: consultationData.statut || 'FAITE',
        observationMedecin: consultationData.observations || '',
        dateConsultation: new Date().toISOString()
      };

      // Ajouter les champs spécifiques si le statut est FAITE
      if (consultationData.statut === 'FAITE') {
        consultationPayload.aptitudeGenerale = consultationData.aptitudeGenerale;
        consultationPayload.aptitudeDetails = {
          hc: consultationData.hc || 'APTE',
          th: consultationData.th || 'APTE',
          cir: consultationData.cir || 'APTE'
        };
        consultationPayload.classe = parseInt(consultationData.classe) || 1;
      }

      try {
        const consultationResponse = await api.post('/consultations', consultationPayload);
        console.log('Consultation créée:', consultationResponse.data);

        // Mettre à jour immédiatement l'employé pour désactiver le bouton et changer le statut
        setEmployes(prev => prev.map(emp =>
          emp._id === selectedEmploye._id
            ? {
                ...emp,
                consultationEffectuee: true,
                consultationStatus: consultationData.statut,
                statutVisite: consultationData.statut,
                consultationId: consultationResponse.data._id
              }
            : emp
        ));

        // Créer la consultation pour le state local
        const nouvelleConsultation = {
          _id: consultationResponse.data._id,
          employeId: {
            _id: selectedEmploye._id,
            nom: selectedEmploye.nom,
            prenom: selectedEmploye.prenom
          },
          statut: consultationData.statut,
          dateConsultation: new Date().toISOString(),
          envoyeAdmin: false
        };

        // Ajouter la nouvelle consultation au state
        setConsultationsTerminees(prev => [...prev, nouvelleConsultation]);

        // Envoyer automatiquement la consultation à l'admin
        try {
          await api.post('/consultations/envoyer-admin', {
            consultations: [consultationResponse.data._id]
          });

          // Mettre à jour le flag envoyeAdmin
          setConsultationsTerminees(prev => prev.map(c =>
            c._id === consultationResponse.data._id
              ? { ...c, envoyeAdmin: true }
              : c
          ));

          console.log('Consultation envoyée automatiquement à l\'admin avec statut:', consultationData.statut);
        } catch (envoyerError) {
          console.error('Erreur lors de l\'envoi automatique à l\'admin:', envoyerError);
          // Ne pas faire échouer la consultation si l'envoi échoue
        }

        // Fermer le modal et afficher un message de succès
        setShowConsultationModal(false);
        setSuccessMessage(`Consultation enregistrée et envoyée à l'admin avec succès pour ${selectedEmploye.prenom} ${selectedEmploye.nom}`);

        // Effacer le message après 3 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

        // NE PAS faire de rafraîchissement automatique pour éviter de perdre le statut local
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Cas spécifique : une consultation existe déjà
          setError(`Une consultation existe déjà pour ${selectedEmploye.prenom} ${selectedEmploye.nom} aujourd'hui`);
          setShowConsultationModal(false);

          // Rafraîchir les données pour mettre à jour l'interface
          await fetchConsultations();

          // Effacer le message d'erreur après 3 secondes
          setTimeout(() => {
            setError(null);
          }, 3000);
        } else {
          throw error; // Propager l'erreur pour qu'elle soit traitée par le bloc catch externe
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la consultation:", error);
      let messageErreur = "Une erreur est survenue lors de l'enregistrement de la consultation.";

      if (error.response) {
        if (error.response.status === 400) {
          messageErreur = `Données invalides: ${error.response.data.message || "Veuillez vérifier les informations saisies"}`;
          console.error("Détails de l'erreur 400:", error.response.data);
        } else if (error.response.status === 401) {
          messageErreur = "Session expirée. Veuillez vous reconnecter.";
        } else if (error.response.status === 403) {
          messageErreur = "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
        } else if (error.response.status === 409) {
          messageErreur = "Une consultation existe déjà pour cet employé aujourd'hui.";
        } else if (error.response.status === 500) {
          messageErreur = "Erreur serveur. Veuillez réessayer plus tard.";
        } else {
          messageErreur = `Erreur: ${error.response.data.message || error.message}`;
        }
      }

      setError(messageErreur);

      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Fonction pour obtenir le badge de statut
  const getConsultationBadge = (employeId, employe = null) => {
    // Debug: Afficher les informations de l'employé
    console.log('getConsultationBadge appelé pour:', {
      employeId,
      employe: employe ? {
        nom: employe.nom,
        statutVisite: employe.statutVisite,
        consultationEffectuee: employe.consultationEffectuee,
        consultationId: employe.consultationId
      } : null
    });

    // Priorité 1: Vérifier le statut local de l'employé (pour mise à jour immédiate)
    if (employe && employe.statutVisite) {
      let variant = 'secondary';
      let text = 'En attente';

      if (employe.statutVisite === 'FAITE') {
        variant = 'success';
        text = 'Fait';
      } else if (employe.statutVisite === 'NON_FAITE') {
        variant = 'danger';
        text = 'Non fait';
      }

      console.log('Statut trouvé dans employe.statutVisite:', text);
      return <Badge bg={variant}>{text}</Badge>;
    }

    // Priorité 2: Chercher dans les consultations terminées
    if (!Array.isArray(consultationsTerminees) || consultationsTerminees.length === 0) {
      return <Badge bg="secondary">En attente</Badge>;
    }

    // Chercher la consultation en gérant différentes structures de données
    const consultation = consultationsTerminees.find(c => {
      // Cas 1: employeId est un objet avec _id
      if (c.employeId && typeof c.employeId === 'object' && c.employeId._id) {
        return c.employeId._id === employeId;
      }
      // Cas 2: employeId est directement l'ID
      if (c.employeId && typeof c.employeId === 'string') {
        return c.employeId === employeId;
      }
      // Cas 3: employeId dans un autre format
      return false;
    });

    if (!consultation) return <Badge bg="secondary">En attente</Badge>;

    let variant = 'secondary';
    let text = 'En attente';

    if (consultation.statut === 'FAITE') {
      variant = 'success';
      text = 'Fait';
    } else if (consultation.statut === 'NON_FAITE') {
      variant = 'danger';
      text = 'Non fait';
    }

    return <Badge bg={variant}>{text}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';

    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour ouvrir le modal d'envoi à l'admin
  const handleEnvoyerAdmin = () => {
    // Filtrer toutes les consultations qui n'ont pas encore été envoyées
    const consultationsNonEnvoyees = consultationsTerminees.filter(c => !c.envoyeAdmin);
    setConsultationsAEnvoyer(consultationsNonEnvoyees);

    // Calculer les statistiques pour affichage dans le modal
    const statsFaites = consultationsNonEnvoyees.filter(c => c.statut === 'FAITE').length;
    const statsNonFaites = consultationsNonEnvoyees.filter(c => c.statut === 'NON_FAITE').length;

    setStatsConsultations({
      faites: statsFaites,
      nonFaites: statsNonFaites,
      total: consultationsNonEnvoyees.length
    });

    setShowEnvoyerModal(true);
  };

  // Fonction pour envoyer les consultations à l'admin
  const envoyerConsultationsAdmin = async () => {
    try {
      setEnvoyerLoading(true);

      // Récupérer les IDs des consultations à envoyer
      const consultationIds = consultationsAEnvoyer.map(c => c._id);

      if (consultationIds.length === 0) {
        setSuccessMessage("Aucune consultation à envoyer");
        setShowEnvoyerModal(false);
        setEnvoyerLoading(false);
        return;
      }

      // Envoyer la requête pour marquer les consultations comme envoyées
      const response = await api.post('/consultations/envoyer-admin', {
        consultations: consultationIds
      });

      console.log("Réponse de l'envoi des consultations:", response.data);

      // Forcer le rafraîchissement complet des données après envoi
      await fetchEmployes(); // Recharger employés ET consultations

      setShowEnvoyerModal(false);
      setSuccessMessage(`${consultationIds.length} consultations envoyées à l'administrateur et archivées avec succès`);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de l'envoi des consultations:", error);
      setError(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setEnvoyerLoading(false);
    }
  };


  return (
    <div className="liste-employes-container">
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="liste-employes-title">Liste des Employés du Jour</h2>
        <div>
          <Button
            variant="secondary"
            className="me-2 history-btn"
            onClick={() => window.location.href = '/medecin/historique'}
            title="Voir l'historique"
          >
            <FaHistory />
          </Button>

          {/* Bouton d'envoi manuel (optionnel) - maintenant que l'envoi est automatique */}
          {Array.isArray(consultationsTerminees) && consultationsTerminees.filter(c => !c.envoyeAdmin).length > 0 && (
            <Button
              variant="warning"
              onClick={handleEnvoyerAdmin}
              className="me-2 compact-btn"
            >
              <FaEnvelope className="me-2" />
              Renvoyer à l'admin ({consultationsTerminees.filter(c => !c.envoyeAdmin).length})
            </Button>
          )}

          <Badge bg="info" className="p-2">
            <FaEnvelope className="me-2" />
            Envoi automatique activé
          </Badge>
        </div>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <>
          {employes.length === 0 ? (
            <Alert variant="info">
              Aucun rendez-vous trouvé pour aujourd'hui. Vérifiez que des rendez-vous ont été planifiés.
            </Alert>
          ) : (
            <Table striped bordered hover className="liste-employes-table">
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Entité</th>
                  <th>Rendez-vous</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employes.map((employe) => (
                  <tr key={employe._id}>
                    <td>{employe.matricule}</td>
                    <td>{employe.nom}</td>
                    <td>{employe.prenom}</td>
                    <td>{employe.entite || 'Non spécifié'}</td>
                    <td>
                      {formatDate(employe.dateRendezVous)}
                      <br />
                      <small>{employe.lieuRendezVous}</small>
                    </td>
                    <td>
                      {getConsultationBadge(employe._id, employe)}
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="consultation-btn-small"
                        onClick={() => handleConsultation(employe)}
                        disabled={
                          // Désactiver si une consultation existe déjà
                          verifierConsultationExistante(employe._id) ||
                          // Ou si l'employé est marqué comme ayant une consultation effectuée
                          employe.consultationEffectuee
                        }
                      >
                        Consultation
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {/* Modal de consultation */}
      <Modal show={showConsultationModal} onHide={() => setShowConsultationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Consultation pour {selectedEmploye?.prenom} {selectedEmploye?.nom}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="statut"
                value={consultationData.statut}
                onChange={handleInputChange}
              >
                <option value="FAITE">Fait</option>
                <option value="NON_FAITE">Non fait</option>
              </Form.Select>
            </Form.Group>

            {consultationData.statut === 'FAITE' && (
              <>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Aptitude générale</Form.Label>
                  <div className="d-flex mb-3">
                    <Form.Check
                      type="radio"
                      id="aptitude-apte"
                      label="APTE"
                      name="aptitudeGenerale"
                      value="APTE"
                      checked={consultationData.aptitudeGenerale === 'APTE'}
                      onChange={handleInputChange}
                      className="me-4"
                    />
                    <Form.Check
                      type="radio"
                      id="aptitude-inapte"
                      label="INAPTE"
                      name="aptitudeGenerale"
                      value="INAPTE"
                      checked={consultationData.aptitudeGenerale === 'INAPTE'}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="border p-3 rounded mb-3">
                    <Form.Label className="fw-bold">Hors Classe (HC)</Form.Label>
                    <div className="d-flex mb-2">
                      <Form.Check
                        type="radio"
                        id="hc-apte"
                        label="APTE"
                        name="hc"
                        value="APTE"
                        checked={consultationData.hc === 'APTE'}
                        onChange={handleInputChange}
                        className="me-4"
                      />
                      <Form.Check
                        type="radio"
                        id="hc-inapte"
                        label="INAPTE"
                        name="hc"
                        value="INAPTE"
                        checked={consultationData.hc === 'INAPTE'}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="border p-3 rounded mb-3">
                    <Form.Label className="fw-bold">Travailleur Handicapé (TH)</Form.Label>
                    <div className="d-flex mb-2">
                      <Form.Check
                        type="radio"
                        id="th-apte"
                        label="APTE"
                        name="th"
                        value="APTE"
                        checked={consultationData.th === 'APTE'}
                        onChange={handleInputChange}
                        className="me-4"
                      />
                      <Form.Check
                        type="radio"
                        id="th-inapte"
                        label="INAPTE"
                        name="th"
                        value="INAPTE"
                        checked={consultationData.th === 'INAPTE'}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="border p-3 rounded">
                    <Form.Label className="fw-bold">Contre-Indication Relative (CIR)</Form.Label>
                    <div className="d-flex mb-2">
                      <Form.Check
                        type="radio"
                        id="cir-apte"
                        label="APTE"
                        name="cir"
                        value="APTE"
                        checked={consultationData.cir === 'APTE'}
                        onChange={handleInputChange}
                        className="me-4"
                      />
                      <Form.Check
                        type="radio"
                        id="cir-inapte"
                        label="INAPTE"
                        name="cir"
                        value="INAPTE"
                        checked={consultationData.cir === 'INAPTE'}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Classe</Form.Label>
                  <Form.Control
                    type="number"
                    name="classe"
                    value={consultationData.classe}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                  />
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Observations</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="observations"
                value={consultationData.observations}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConsultationModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={saveConsultation}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'envoi à l'admin */}
      <Modal show={showEnvoyerModal} onHide={() => setShowEnvoyerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Envoyer les consultations à l'administrateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {consultationsAEnvoyer.length === 0 ? (
            <Alert variant="info">
              Toutes les consultations ont déjà été envoyées à l'administrateur.
            </Alert>
          ) : (
            <>
              <p>Vous êtes sur le point d'envoyer {consultationsAEnvoyer.length} consultation(s) à l'administrateur.</p>

              <div className="mb-3">
                <h5>Résumé des consultations :</h5>
                <ul className="list-unstyled">
                  <li>
                    <Badge bg="success" className="me-2">{statsConsultations.faites}</Badge>
                    Consultations terminées
                  </li>
                  <li>
                    <Badge bg="danger" className="me-2">{statsConsultations.nonFaites}</Badge>
                    Consultations non faites
                  </li>
                </ul>
              </div>

              <Alert variant="info">
                Une notification sera envoyée à l'administrateur avec ces informations.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEnvoyerModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={envoyerConsultationsAdmin}
            disabled={consultationsAEnvoyer.length === 0 || envoyerLoading}
          >
            {envoyerLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Envoi en cours...
              </>
            ) : (
              'Envoyer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListeEmployes;
