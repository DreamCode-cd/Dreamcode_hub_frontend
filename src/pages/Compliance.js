import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Shield, AlertTriangle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Compliance = () => {
  const [report, setReport] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/compliance-reports`, { content: report });
      toast.success('Signalement soumis', {
        description: 'Votre signalement anonyme a été transmis au manager'
      });
      setReport('');
    } catch (error) {
      toast.error('Échec de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const reglement = `
                    RÈGLEMENT INTERNE - Dreamcode
1. Culture & ADN
  Mission
  Dreamcode développe des solutions logicielles essentielles pour moderniser les secteurs immobilier, sécuritaire, médical et autres secteurs stratégiques en RDC et en Afrique. L’objectif est de fournir des outils à fort impact socio-économique et d’atteindre une croissance commerciale significative.

  Vision
  Devenir la référence régionale en matière de solutions logicielles critiques, reconnue pour la robustesse technique, la fiabilité opérationnelle et la contribution au développement national.

  Valeurs
    Discipline : respect strict des engagements et des processus.
    Excellence : qualité, tests et documentation systématiques.
    Responsabilité : chaque action est tracée et imputable.
    Intégrité : transparence et conformité aux bonnes pratiques.
    Esprit collectif : coopération entre cofondateurs, partage des savoirs.
    
  Diversité & Inclusion
  Recrutement et traitement fondés sur le mérite et les compétences ; tolérance zéro pour toute forme de discrimination.

2. Vie au travail & Organisation
  2.1 Structure et rôles
    L’entreprise compte six membres, tous actionnaires-cofondateurs :
      Manager : supervision globale, arbitrage et validation finale des décisions.
      Secrétaire : gestion documentaire, comptes rendus, suivi administratif.
      Chargé de marketing : prospection de contrats, publicité, communication externe, partenariats et visibilité de la société.
      Chef de projet Mobile : pilotage des projets mobiles.
      Chef de projet Web : pilotage des projets web.
      Chef de projet Autres Solutions : supervision des projets hors web/mobile (IA, desktop, automatisations, etc.).

  2.2 Modalité de travail / Présence
    Chaque membre travaille individuellement depuis son environnement personnel (pas de local).
    Les horaires sont définis par les chefs de projets pour leurs périmètres respectifs sur des périodes données (journée, semaine ou sprint).
    Chaque membre doit respecter strictement les horaires fixés et rendre compte régulièrement de son avancement.
    Le Manager supervise la cohérence inter-pôles et ajuste les horaires si nécessaire.

  2.3 Réunions — règles strictes
    Toute réunion planifiée est obligatoire pour les participants conviés. Retards et absences ne sont pas tolérés.
    Notification d’indisponibilité : la veille au plus tard. Exception : cas de force majeure le matin même, avec justification.
    Les réunions doivent avoir un ordre du jour précis, durée limitée et produire un compte rendu rédigé par le Secrétaire.
    Les décisions prises sont exécutoires immédiatement.

  2.4 Délais et livrables
    Les échéances (livrables, validations) doivent être respectées.
    Tout empêchement doit être signalé 48 heures avant la date d’échéance.
    Les chefs de projets supervisent l’avancement, mais chaque membre est responsable de ses tâches.
    Les livrables doivent respecter les standards internes de qualité et documentation.

  2.5 Communication interne et gestion des désaccords
    Tous les échanges doivent passer par les canaux officiels.
    Toute contestation ou suggestion concernant une décision de réunion doit être adressée exclusivement au Manager ou au Secrétaire, qui assurent l’examen, la traçabilité et, si nécessaire, la discussion en réunion.


3. Ops & IT

  3.1 Sécurité des données
    Confidentialité et protection de toutes les informations internes et projets.
    Interdiction de stocker des données sensibles sur des appareils non sécurisés.
    Signalement immédiat de toute faille ou incident.
    Authentification renforcée sur tous les outils sensibles.

  3.2 Gestion du matériel
    Chaque membre est responsable du matériel qui lui est confié.
    Toute perte ou défaillance doit être rapportée immédiatement.
    Usage strictement professionnel.

  3.3 Stack technique & outils
    Backend : Node.js, Python (tout dépend du projet)
    Frontend : React, Next.js (tout dépend du projet)
    Mobile : Flutter (tout dépend du projet)
    Autres solutions : IA, desktop, automatisations
    Infra / CI-CD : Docker, Kubernetes, pipelines GitHub Actions / GitLab CI
    Monitoring / erreurs : Prometheus, Grafana, Sentry
    Bases de données : PostgreSQL, MongoDB
    Collaboration / suivi : GitHub / GitLab, Notion, Slack / Teams / Dreamcode hub

  3.4 Conformité et propriété
    Tout code, documentation et livrable appartiennent à la société.
    Respect strict des licences et normes de conformité.
    Accès production réservé aux responsables habilités.

4. RH & ADMINISTRATIF
  Article 4.1 – Congés et Absences
    4.1.1 — L’ensemble des collaborateurs bénéficie des congés annuels conformément aux dispositions légales en vigueur.
    4.1.2 — Toute demande de congé doit être formulée via l’outil interne prévu à cet effet, au minimum quinze (15) jours avant la date souhaitée, sauf circonstances exceptionnelles.
    4.1.3 — Les absences imprévues (maladie, urgence familiale) doivent être signalées au responsable hiérarchique dans les plus brefs délais.
    4.1.4 — Les congés exceptionnels (événements familiaux, obligations administratives) sont accordés sur présentation de justificatif.
    4.1.5 — L’entreprise se réserve le droit de refuser une demande de congé lorsque les impératifs opérationnels l’exigent, tout en veillant à respecter les droits du collaborateur.
  Article 4.2 – Rémunération, Révision salariale et BSPCE
    4.2.1 — La rémunération est établie selon la grille interne, tenant compte du poste, des responsabilités, de l’expérience et de la performance du collaborateur.
    4.2.2 — Une révision salariale annuelle peut être effectuée sur la base de critères objectifs : performance, évolution des compétences, contribution à l’entreprise et état économique global.
    4.2.3 — Lorsque l’entreprise propose un dispositif de BSPCE, actions ou stock-options, celui-ci est alloué selon des règles transparentes liées au niveau de responsabilité, à l'ancienneté et aux objectifs atteints.
    4.2.4 — Les collaborateurs doivent préserver la confidentialité relative à leur rémunération et à celle de leurs collègues.
  Article 4.3 – Avantages et Ressources mises à disposition
    4.3.1 — L’entreprise fournit le matériel nécessaire à l’exercice des fonctions du collaborateur (ordinateur, accessoires, logiciels, comptes d’accès).
    4.3.2 — Le matériel demeure la propriété exclusive de l’entreprise et doit être utilisé conformément aux politiques internes.
    4.3.3 — L’entreprise peut proposer divers avantages : assurance santé, contribution au transport, tickets repas, primes, selon la réglementation et les décisions de la direction.
    4.3.4 — L’entreprise s’engage à soutenir la montée en compétence des collaborateurs via des formations, ateliers et certifications selon les besoins des projets.
  Article 4.4 – Évaluation et Développement de carrière
    4.4.1 — Chaque collaborateur bénéficie d’un entretien professionnel au minimum une fois par an afin d’évaluer ses performances, identifier ses besoins et fixer des objectifs.
    4.4.2 — Les promotions, changements de poste et augmentations sont attribués sur la base du mérite, des compétences démontrées et de la disponibilité des postes.
    4.4.3 — La mobilité interne (changement d’équipe, de projet ou de département) est encouragée si elle favorise le développement du collaborateur et les besoins de l’entreprise.
    4.4.4 — Tout plan de progression ou programme de formation doit être validé conjointement par le collaborateur, le manager et le département RH.
  Article 4.5 – Dossiers administratifs et conformité
    4.5.1 — Chaque collaborateur doit fournir l’ensemble des documents administratifs requis lors de l’embauche et les mettre à jour en cas de changement de situation personnelle.
    4.5.2 — Toute information transmise au département RH doit être exacte ; une déclaration mensongère constitue un manquement grave pouvant entraîner des sanctions.
    4.5.3 — L’entreprise s’engage à respecter la confidentialité et la sécurisation du dossier administratif des collaborateurs.
  
5. CODE DE CONDUITE
  Article 5.1 – Principes Éthiques
    5.1.1 — Les collaborateurs doivent adopter en tout temps un comportement intègre, professionnel et conforme aux lois en vigueur.
    5.1.2 — Est strictement prohibée toute forme de corruption, de fraude, de favoritisme ou de manipulation de données.
    5.1.3 — La transparence dans les décisions, communications et interactions professionnelles est un devoir moral et organisationnel.
  Article 5.2 – Confidentialité et Protection des informations
    5.2.1 — Toute information interne, client, fournisseur ou partenaire est strictement confidentielle et ne peut être divulguée sans autorisation explicite.
    5.2.2 — Les collaborateurs doivent protéger l’accès à leur matériel et comptes professionnels (mot de passe, authentification, VPN).
    5.2.3 — Toute perte, fuite ou compromission de données doit être signalée immédiatement au service IT ou à la direction.
    5.2.4 — Les données personnelles et les informations sensibles doivent être traitées conformément aux standards internationaux (RGPD ou équivalent local).
   
  Article 5.3 – Conflits d’intérêts
    5.3.1 — Un collaborateur ne peut participer à une activité, interne ou externe, susceptible d’entrer en conflit avec les intérêts de l’entreprise sans en informer la direction.
    5.3.2 — Toute activité parallèle (freelance, startup, partenariat, association) dans le domaine technologique doit être déclarée.
    5.3.3 — Le collaborateur s’interdit d’utiliser ses fonctions pour obtenir un avantage personnel ou influencer une décision dans son intérêt.
  Article 5.4 – Lutte contre le harcèlement, les discriminations et comportements inappropriés
    5.4.1 — L’entreprise adopte une politique de tolérance zéro envers le harcèlement moral, le harcèlement sexuel et toute forme de discrimination (origine, genre, croyance, handicap, etc.).
    5.4.2 — Tout collaborateur doit maintenir un environnement de travail respectueux, courtois et inclusif.
    5.4.3 — Les plaintes et signalements seront traités de manière confidentielle et impartiale, sans représailles envers la personne ayant signalé un fait.
    5.4.4 — Les comportements agressifs, menaçants ou irrespectueux sont passibles de sanctions disciplinaires.
  Article 5.5 – Respect des ressources et de l’environnement de travail
    5.5.1 — Le matériel et les logiciels mis à disposition doivent être utilisés uniquement dans un cadre professionnel, sauf dérogation accordée par la direction.
    5.5.2 — Toute installation de logiciel non autorisé est interdite.
    5.5.3 — Le collaborateur doit veiller à la propreté, à l'ordre et au bon usage des locaux et infrastructures.
    5.5.4 — L’entreprise encourage les pratiques responsables : réduction du gaspillage, économie d’énergie, usage raisonné des serveurs et ressources cloud.
  Article 5.6 – Communication et Engagement professionnel
    5.6.1 — Les échanges internes doivent être réalisés dans un esprit de collaboration, de transparence et de respect mutuel.
    5.6.2 — Les collaborateurs représentant l’entreprise (réunions clients, conférences, réseaux sociaux) doivent adopter un discours professionnel et conforme à la mission de l’organisation.
    5.6.3 — Toute prise de parole publique concernant l’entreprise doit être validée par la direction lorsqu’elle engage son image ou sa stratégie.
  Article 5.7 – Sanctions disciplinaires
    5.7.1 — Tout manquement aux présentes règles pourra entraîner des sanctions allant de l’avertissement à la rupture du contrat de travail, en fonction de la gravité des faits.
    5.7.2 — Les sanctions sont appliquées de manière proportionnée, équitable et conforme à la législation.
    5.7.3 — Le collaborateur est en droit d’être entendu et de présenter sa version des faits avant toute décision définitive.

Dispositions disciplinaires et entrée en vigueur
Manquements répétés (retards, absences, non-respect des délais, non-application des décisions) entraînent : avertissement, retrait temporaire de responsabilités, réaffectation des tâches ou décision collégiale.
  `;

  return (
    <div data-testid="compliance-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conformité & Signalement</h1>
        <p className="text-muted-foreground mt-1">
          Consultez le règlement et signalez tout problème de manière anonyme
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Règlement Intérieur
            </CardTitle>
            <CardDescription>
              Document officiel à respecter par tous les membres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{reglement}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Signalement Anonyme
            </CardTitle>
            <CardDescription>
              Signalez tout problème de conformité de manière confidentielle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report">Votre signalement *</Label>
                <Textarea
                  id="report"
                  data-testid="compliance-report-input"
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  placeholder="Décrivez la situation en détail..."
                  rows={12}
                  required
                />
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Confidentialité garantie:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Votre identité ne sera pas révélée</li>
                  <li>• Seul le manager aura accès au signalement</li>
                  <li>• Traitement confidentiel assuré</li>
                  <li>• Aucune représaille possible</li>
                </ul>
              </div>

              <Button
                data-testid="submit-compliance-button"
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'Envoi en cours...' : 'Soumettre le signalement'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Compliance;