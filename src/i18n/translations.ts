import type { CryCategory, FeedingType, Language, SafetyRedFlagId, SoundTrait } from '../types/babycry';

export interface TranslationBundle {
  brandName: string;
  brandSubtitle: string;
  nav: {
    home: string;
    record: string;
    history: string;
    guides: string;
    settings: string;
    profile: string;
  };
  consent: {
    title: string;
    subtitle: string;
    bulletAudio: string;
    bulletEncryption: string;
    bulletMedical: string;
    bulletCommercial: string;
    checkboxLabel: string;
    datasetOptInLabel: string;
    acceptCta: string;
    viewPolicy: string;
  };
  home: {
    heroTitle: string;
    heroDescription: string;
    recordCta: string;
    uploadShortcut: string;
    activeBabyLabel: string;
    noBabyTitle: string;
    noBabyDesc: string;
    createProfileCta: string;
    editProfileCta: string;
    safetyBannerTitle: string;
    safetyBannerDesc: string;
    safetyBannerCta: string;
    latestInsightTitle: string;
    noHistoryYet: string;
    viewAllHistory: string;
    ageTipTitle: string;
  };
  profile: {
    title: string;
    subtitle: string;
    addNew: string;
    nameLabel: string;
    namePlaceholder: string;
    birthDateLabel: string;
    feedingLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    saveCta: string;
    cancelCta: string;
    deleteCta: string;
    activeTag: string;
    selectCta: string;
    ageLabel: string;
    stageAdviceLabel: string;
    validationName: string;
    validationDate: string;
    savedToast: string;
  };
  feedingTypes: Record<FeedingType, string>;
  record: {
    title: string;
    subtitle: string;
    safetyCheckTitle: string;
    safetyCheckDesc: string;
    temperatureLabel: string;
    temperaturePlaceholder: string;
    emergencyTitle: string;
    emergencyDesc: string;
    emergencyActionPrimary: string;
    emergencyClearBtn: string;
    mainButtonStart: string;
    mainButtonStop: string;
    recordingStatus: string;
    readyStatus: string;
    contextNoteLabel: string;
    contextNotePlaceholder: string;
    uploadLabel: string;
    uploadHint: string;
    testLabTitle: string;
    testLabDesc: string;
    testSampleHunger: string;
    testSamplePain: string;
    testSampleFatigue: string;
    testSampleSilence: string;
    analyzeLoadedBtn: string;
    micErrorTitle: string;
    micErrorFallback: string;
    analyzingTitle: string;
    analyzingStep1: string;
    analyzingStep2: string;
    analyzingStep3: string;
  };
  results: {
    title: string;
    primaryLabel: string;
    otherPossibilities: string;
    modelConfidenceLabel: string;
    confidenceDisclaimer: string;
    durationLabel: string;
    observedTraitsLabel: string;
    acousticMetricsLabel: string;
    pitchLabel: string;
    loudnessLabel: string;
    burstsLabel: string;
    suddenShiftYes: string;
    suddenShiftNo: string;
    explanationLabel: string;
    practicalTipsLabel: string;
    audioPlaybackLabel: string;
    medicalSafetyTitle: string;
    medicalNeverReplaces: string;
    inconclusiveBadge: string;
    feedbackTitle: string;
    feedbackDesc: string;
    feedbackHelpfulYes: string;
    feedbackHelpfulNo: string;
    feedbackCategoryLabel: string;
    feedbackSubmit: string;
    feedbackSaved: string;
    recordAnotherCta: string;
    backToHistoryCta: string;
    gauge: {
      title: string;
      currentLabel: string;
      historicalAvgLabel: string;
      sourceUserHistory: string;
      sourceModelBaseline: string;
      tierAbove: string;
      tierOnPar: string;
      tierBelow: string;
      deltaLabel: string;
      refinementTitle: string;
      categorySamplesLabel: string;
      impactLabels: {
        high: string;
        medium: string;
        calibration: string;
        low: string;
      };
      reasons: {
        inconclusive_audio: string;
        underrepresented_category: string;
        ambiguous_boundary: string;
        below_average_edge_case: string;
        strong_anchor: string;
        balanced_reinforcement: string;
      };
      optInActiveNote: string;
      optInInactiveNote: string;
      enableOptInBtn: string;
      submittedNote: string;
    };
  };
  history: {
    title: string;
    subtitle: string;
    filterAllBabies: string;
    filterAllCategories: string;
    evolutionTitle: string;
    evolutionDesc: string;
    categoryDistributionTitle: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyCta: string;
    deleteConfirm: string;
    deleteBtn: string;
    inspectBtn: string;
    playBtn: string;
    pauseBtn: string;
    expiresLabel: string;
  };
  guides: {
    title: string;
    subtitle: string;
    categoriesTitle: string;
    traitsTitle: string;
    safetySectionTitle: string;
    safetySectionDesc: string;
    aiModelTitle: string;
    aiModelDesc: string;
    specializedModelTitle: string;
    specializedModelSteps: string[];
  };
  settings: {
    title: string;
    subtitle: string;
    languageLabel: string;
    privacySectionTitle: string;
    consentStatusLabel: string;
    consentGranted: string;
    consentNotGranted: string;
    datasetToggleLabel: string;
    datasetToggleDesc: string;
    datasetCountLabel: string;
    retentionLabel: string;
    retentionOptions: { value: 0 | 7 | 30 | 90; label: string }[];
    encryptionTitle: string;
    encryptionDesc: string;
    policyTitle: string;
    policyBody: string[];
    eraseAllTitle: string;
    eraseAllDesc: string;
    eraseAllBtn: string;
    eraseAllConfirmBtn: string;
    eraseCancelBtn: string;
    savedMessage: string;
  };
  categories: Record<CryCategory, { label: string; description: string; quickTips: string[] }>;
  traits: Record<SoundTrait, { label: string; description: string }>;
  safetyFlags: Record<SafetyRedFlagId, { label: string; detail: string }>;
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  fr: {
    brandName: 'BABYCRY AI',
    brandSubtitle: "L'intelligence qui comprend les pleurs de bébé",
    nav: {
      home: 'Accueil',
      record: 'Enregistrer',
      history: 'Historique',
      guides: 'Conseils',
      settings: 'Paramètres',
      profile: 'Profil bébé',
    },
    consent: {
      title: 'Bienvenue sur BABYCRY AI',
      subtitle:
        'Un assistant apaisant pour mieux comprendre les pleurs de votre bébé, dans le respect total de votre vie privée.',
      bulletAudio:
        "Les enregistrements audio sont des données sensibles : ils ne sont analysés qu'avec votre consentement explicite.",
      bulletEncryption:
        'Chiffrement AES-256-GCM au repos, durée de conservation limitée et suppression définitive possible à tout moment.',
      bulletMedical:
        "BABYCRY AI fournit des hypothèses acoustiques avec un niveau de confiance. Il ne remplace jamais l'avis d'un pédiatre.",
      bulletCommercial:
        'Aucune utilisation commerciale de vos enregistrements sans votre autorisation explicite.',
      checkboxLabel:
        "Je suis le parent ou responsable légal et j'accepte l'enregistrement et l'analyse audio selon la politique de confidentialité.",
      datasetOptInLabel:
        "Facultatif : autoriser l'envoi de caractéristiques acoustiques anonymisées (sans audio ni nom) lorsque je confirme une cause, afin d'améliorer la précision du modèle.",
      acceptCta: 'Commencer en toute confiance',
      viewPolicy: 'Lire la politique de confidentialité',
    },
    home: {
      heroTitle: 'Écoutez et comprenez les besoins de votre bébé',
      heroDescription:
        "Enregistrez quelques secondes de pleurs pour obtenir des hypothèses claires, des repères acoustiques et des conseils pratiques adaptés à l'âge de votre enfant.",
      recordCta: 'ENREGISTRER LES PLEURS',
      uploadShortcut: 'Importer un fichier audio',
      activeBabyLabel: 'Profil actif',
      noBabyTitle: 'Ajoutez le profil de votre bébé',
      noBabyDesc:
        "Indiquez son prénom et sa date de naissance pour adapter les conseils et les alertes de sécurité à son âge.",
      createProfileCta: 'Créer un profil bébé',
      editProfileCta: 'Modifier le profil',
      safetyBannerTitle: "Signes d'alerte médicale",
      safetyBannerDesc:
        'Respiration difficile, lèvres bleutées/grisâtres, somnolence inhabituelle ou fièvre >= 38 °C avant 3 mois ? Consultez un médecin en urgence.',
      safetyBannerCta: 'Vérifier les signes',
      latestInsightTitle: 'Dernière analyse',
      noHistoryYet:
        "Aucun enregistrement analysé pour l'instant. Appuyez sur « ENREGISTRER LES PLEURS » pour démarrer.",
      viewAllHistory: "Voir tout l'historique",
      ageTipTitle: "Repère adapté à l'âge",
    },
    profile: {
      title: 'Profil du bébé',
      subtitle: "Les conseils et les seuils d'alerte s'adaptent automatiquement à l'âge exact du bébé.",
      addNew: 'Nouveau profil',
      nameLabel: 'Prénom ou pseudonyme',
      namePlaceholder: 'Ex. Léo, Maya...',
      birthDateLabel: 'Date de naissance',
      feedingLabel: 'Alimentation actuelle',
      notesLabel: 'Informations facultatives utiles (reflux, prématurité, habitudes)',
      notesPlaceholder: 'Ex. léger reflux après la tétée, dernier repas il y a 2h...',
      saveCta: 'Enregistrer le profil',
      cancelCta: 'Annuler',
      deleteCta: 'Supprimer ce profil',
      activeTag: 'Profil sélectionné',
      selectCta: 'Sélectionner',
      ageLabel: 'Âge calculé',
      stageAdviceLabel: 'Recommandation selon la tranche d’âge',
      validationName: 'Veuillez saisir un prénom ou pseudonyme.',
      validationDate: 'Veuillez choisir une date de naissance valide.',
      savedToast: 'Profil enregistré et chiffré.',
    },
    feedingTypes: {
      breastfeeding: 'Allaitement maternel',
      formula: 'Lait infantile (biberon)',
      mixed: 'Allaitement mixte',
      solids: 'Alimentation diversifiée',
    },
    record: {
      title: 'Enregistrement des pleurs',
      subtitle: 'Placez le téléphone à environ 30-50 cm de votre bébé dans un endroit calme.',
      safetyCheckTitle: 'Contrôle sécurité pédiatrique rapide (avant analyse)',
      safetyCheckDesc:
        "Cochez si vous observez l'un de ces signes maintenant. En cas d'alerte, la priorité est médicale.",
      temperatureLabel: 'Température mesurée (optionnel, °C)',
      temperaturePlaceholder: 'Ex. 37.2',
      emergencyTitle: 'Évaluation médicale urgente recommandée',
      emergencyDesc:
        "Un ou plusieurs signes préoccupants ont été signalés. Ne poursuivez pas l'analyse audio : contactez immédiatement votre pédiatre, le 15 / 112 ou les urgences pédiatriques.",
      emergencyActionPrimary: 'Consulter les consignes de sécurité',
      emergencyClearBtn: "Réinitialiser le contrôle (aucun de ces signes n'est présent)",
      mainButtonStart: 'ENREGISTRER LES PLEURS',
      mainButtonStop: "ARRÊTER ET ANALYSER",
      recordingStatus: 'Capture audio et spectre en cours...',
      readyStatus: 'Prêt à enregistrer les pleurs',
      contextNoteLabel: 'Contexte rapide (optionnel)',
      contextNotePlaceholder: 'Ex. réveillé depuis 1h30, dernier biberon il y a 3h...',
      uploadLabel: 'Ou importer un fichier audio (.wav, .mp3, .webm, .ogg)',
      uploadHint: 'Analyse acoustique réelle effectuée localement puis via Google AI',
      testLabTitle: 'Échantillons acoustiques réels de démonstration (WAV 16 kHz)',
      testLabDesc:
        'Sans microphone disponible, vous pouvez générer un signal WAV acoustique réel et le soumettre au moteur DSP + Google AI :',
      testSampleHunger: 'Signal rythmique (type faim)',
      testSamplePain: 'Signal aigu soudain (type douleur/gaz)',
      testSampleFatigue: 'Signal faible grave (type fatigue)',
      testSampleSilence: 'Bruit ambiant calme (test rejet)',
      analyzeLoadedBtn: "Lancer l'analyse IA sur cet audio",
      micErrorTitle: 'Accès au microphone indisponible',
      micErrorFallback:
        "Vous pouvez importer un fichier audio ou utiliser un échantillon acoustique WAV réel ci-dessous.",
      analyzingTitle: 'Analyse acoustique et IA en cours...',
      analyzingStep1: 'Extraction des caractéristiques sonores (fréquence Hz, intensité dB, salves)',
      analyzingStep2: 'Détection des motifs de pleurs et variations soudaines',
      analyzingStep3: 'Interprétation multimodale via Google AI',
    },
    results: {
      title: "Résultat de l'analyse",
      primaryLabel: 'Interprétation principale (hypothèse)',
      otherPossibilities: 'Autres interprétations possibles',
      modelConfidenceLabel: 'Confiance du modèle',
      confidenceDisclaimer:
        "Ce pourcentage représente la confiance du modèle dans sa classification audio et non une probabilité médicale confirmée.",
      durationLabel: "Durée de l'enregistrement",
      observedTraitsLabel: 'Caractéristiques sonores observées',
      acousticMetricsLabel: 'Mesures acoustiques extraites',
      pitchLabel: 'Fréquence fondamentale',
      loudnessLabel: 'Intensité moyenne (RMS)',
      burstsLabel: 'Salves détectées',
      suddenShiftYes: 'Changement soudain détecté',
      suddenShiftNo: 'Évolution régulière',
      explanationLabel: "Explication simple de l'interprétation",
      practicalTipsLabel: 'Conseils pratiques adaptés',
      audioPlaybackLabel: 'Réécouter l’enregistrement (déchiffré à la demande)',
      medicalSafetyTitle: 'Rappel médical important',
      medicalNeverReplaces:
        "BABYCRY AI ne remplace jamais un pédiatre et ne peut jamais affirmer qu'un bébé est en bonne santé uniquement à partir de ses pleurs.",
      inconclusiveBadge: 'Signal peu concluant / aucun pleur net détecté',
      feedbackTitle: 'Aider à améliorer les hypothèses',
      feedbackDesc: 'Qu’est-ce qui a finalement apaisé votre bébé ?',
      feedbackHelpfulYes: 'Utile',
      feedbackHelpfulNo: 'Peu utile',
      feedbackCategoryLabel: 'Cause réelle observée',
      feedbackSubmit: 'Enregistrer mon retour',
      feedbackSaved: 'Merci ! Votre retour est enregistré.',
      recordAnotherCta: 'Nouvel enregistrement',
      backToHistoryCta: "Voir l'historique",
      gauge: {
        title: 'Jauge de confiance et repère historique',
        currentLabel: 'Cette analyse',
        historicalAvgLabel: 'Moyenne historique',
        sourceUserHistory: 'Vos analyses précédentes',
        sourceModelBaseline: 'Repère de référence du modèle',
        tierAbove: 'Au-dessus de la moyenne',
        tierOnPar: 'Dans la moyenne',
        tierBelow: 'En dessous de la moyenne',
        deltaLabel: 'Écart',
        refinementTitle: 'Impact pour affiner cette catégorie',
        categorySamplesLabel: 'Contributions anonymisées pour cette catégorie',
        impactLabels: {
          high: 'Fort apport informatif',
          medium: 'Apport utile',
          calibration: 'Ancre de calibration',
          low: 'Signal trop flou pour entraîner',
        },
        reasons: {
          inconclusive_audio:
            "Cet enregistrement manque de pleurs nets : il vaut mieux ne pas l'utiliser pour calibrer la catégorie.",
          underrepresented_category:
            "Cette catégorie contient encore peu d'exemples confirmés : votre retour aide directement à réduire les confusions sur ce type de pleurs.",
          ambiguous_boundary:
            "L'écart avec la deuxième hypothèse est serré : confirmer la cause réelle aide le modèle à tracer une frontière acoustique plus nette.",
          below_average_edge_case:
            'La confiance est inférieure à la moyenne habituelle : ce cas atypique est précieux pour renforcer les situations difficiles.',
          strong_anchor:
            'Signal net avec forte confiance : votre confirmation consolide le profil acoustique de référence et la calibration des pourcentages.',
          balanced_reinforcement:
            'Votre retour anonyme permet de suivre la stabilité de cette catégorie selon l’âge du bébé.',
        },
        optInActiveNote:
          "Contribution anonymisée activée : en validant votre retour ci-dessous, seules les mesures acoustiques (sans audio ni prénom) affineront cette catégorie.",
        optInInactiveNote:
          'La contribution anonymisée est désactivée : vous pouvez l’activer pour que votre retour aide à calibrer cette catégorie (jamais d’audio brut envoyé).',
        enableOptInBtn: 'Autoriser la contribution anonymisée',
        submittedNote: 'Retour enregistré pour cette analyse.',
      },
    },
    history: {
      title: 'Historique et évolution',
      subtitle: 'Consultez les enregistrements précédents, suivez les tendances et supprimez vos données à tout moment.',
      filterAllBabies: 'Tous les bébés',
      filterAllCategories: 'Toutes les catégories',
      evolutionTitle: 'Évolution des pleurs dans le temps',
      evolutionDesc: 'Intensité sonore (dB), fréquence (Hz) et répartition des hypothèses récentes.',
      categoryDistributionTitle: 'Répartition des hypothèses',
      emptyTitle: 'Aucun enregistrement enregistré',
      emptyDesc: 'Vos analyses apparaîtront ici avec la date, les mesures sonores et les conseils.',
      emptyCta: 'Enregistrer un premier pleur',
      deleteConfirm: 'Supprimer définitivement cet enregistrement et son fichier audio chiffré ?',
      deleteBtn: 'Supprimer',
      inspectBtn: 'Voir le détail',
      playBtn: 'Écouter',
      pauseBtn: 'Pause',
      expiresLabel: 'Expiration auto',
    },
    guides: {
      title: 'Conseils aux parents & IA',
      subtitle: 'Comprendre les 9 types de pleurs, les signaux vocaux, la sécurité pédiatrique et le fonctionnement du modèle.',
      categoriesTitle: 'Les 9 catégories de pleurs analysées',
      traitsTitle: 'Signatures sonores particulières',
      safetySectionTitle: 'Quand consulter un médecin en urgence',
      safetySectionDesc:
        "Si vous observez l'un des signes suivants, arrêtez l'analyse audio et consultez immédiatement un service médical :",
      aiModelTitle: 'Comment fonctionne BABYCRY AI ?',
      aiModelDesc:
        "Le système combine une extraction acoustique DSP (fréquence fondamentale f0, intensité RMS, détection de salves et ruptures soudaines) avec l'analyse audio multimodale Google AI (gemini-4-hydrogen). Il présente uniquement des hypothèses et refuse d'inventer un diagnostic si aucun pleur n'est audible.",
      specializedModelTitle: 'Intégrer et tester un modèle spécialisé dédié aux pleurs de nourrissons',
      specializedModelSteps: [
        "Architecture prête via la variable serveur CRY_CLASSIFIER_ENDPOINT (JSON POST avec audioBase64 + caractéristiques acoustiques).",
        "Corpus validés recommandés avec autorisations légales : Donate-a-Cry, BabyChillanto ou corpus cliniques anonymisés approuvés par un comité d'éthique.",
        "Extraction de spectrogrammes Log-Mel / MFCC et classification par CNN / AST / YAMNet affiné, évaluée par matrice de confusion et F1-score par tranche d'âge.",
        "Les retours parents opt-in stockent uniquement les vecteurs DSP anonymisés (sans audio ni identité) pour calibrer progressivement les seuils.",
      ],
    },
    settings: {
      title: 'Paramètres et confidentialité',
      subtitle: 'Contrôlez votre langue, votre consentement, la durée de conservation et la suppression des données.',
      languageLabel: "Langue de l'application",
      privacySectionTitle: 'Consentement et amélioration éthique',
      consentStatusLabel: 'Consentement parental explicite',
      consentGranted: 'Accordé',
      consentNotGranted: 'Non accordé',
      datasetToggleLabel: "Contribution anonymisée à l'amélioration du modèle",
      datasetToggleDesc:
        "Autoriser l'enregistrement de métriques acoustiques anonymes (jamais d'audio brut ni de prénom) lors de vos retours.",
      datasetCountLabel: 'Contributions anonymisées enregistrées',
      retentionLabel: 'Durée de conservation limitée',
      retentionOptions: [
        { value: 0, label: "Suppression immédiate après l'analyse" },
        { value: 7, label: '7 jours maximum' },
        { value: 30, label: '30 jours maximum' },
        { value: 90, label: '90 jours maximum' },
      ],
      encryptionTitle: 'Chiffrement et sécurité active',
      encryptionDesc:
        'Les fichiers audio et les notes de profil sont chiffrés au repos sur le serveur avec AES-256-GCM. Aucun partage public ou commercial.',
      policyTitle: 'Politique de confidentialité claire',
      policyBody: [
        '1. Finalité stricte : les enregistrements servent uniquement à aider le parent à interpréter les pleurs.',
        '2. Consentement explicite : aucune analyse audio ne démarre sans votre accord préalable.',
        '3. Chiffrement & conservation limitée : les audios sont chiffrés en AES-256-GCM et purgés automatiquement après la durée choisie.',
        '4. Contrôle total : vous pouvez supprimer un enregistrement ou effacer toutes vos données définitivement en un clic.',
        '5. Zéro usage commercial : vos fichiers audio ne sont jamais vendus ni utilisés à des fins publicitaires.',
      ],
      eraseAllTitle: 'Suppression définitive des données',
      eraseAllDesc:
        'Efface immédiatement tous les profils de bébé, tous les enregistrements chiffrés, l’historique et réinitialise le consentement.',
      eraseAllBtn: 'Tout supprimer définitivement',
      eraseAllConfirmBtn: 'Confirmer la suppression définitive',
      eraseCancelBtn: 'Annuler',
      savedMessage: 'Paramètres mis à jour.',
    },
    categories: {
      hunger: {
        label: 'Faim possible',
        description: 'Pleurs souvent rythmés, montant progressivement en intensité, parfois avec succion des poings.',
        quickTips: [
          "Vérifiez l'heure de la dernière tétée ou du dernier biberon.",
          'Observez les signes précoces : cherche le sein/biberon, suce ses doigts, tourne la tête.',
          'Installez bébé confortablement au calme pour nourrir sans précipitation.',
        ],
      },
      fatigue: {
        label: 'Fatigue et sommeil',
        description: 'Pleurs souvent plus plaintifs, intermittents ou accompagnés de gémissements qui décroissent puis reprennent.',
        quickTips: [
          'Tamisez la lumière et réduisez les stimulations sonores.',
          'Observez les bâillements, le regard fixe ou le frottement des yeux.',
          'Bercez doucement en position verticale ou allongez bébé sur le dos dans son lit sécurisé.',
        ],
      },
      discomfort: {
        label: 'Inconfort physique',
        description: "Pleurs continus d'intensité moyenne signalant une gêne (vêtement serré, position, étiquette, lumière).",
        quickTips: [
          'Vérifiez qu’aucun vêtement, pli ou chaussette ne serre la peau ou les orteils.',
          'Changez doucement la position du bébé.',
          'Contrôlez la luminosité ou le bruit environnant.',
        ],
      },
      diaper: {
        label: 'Couche sale ou mouillée',
        description: "Pleurs agacés ou continus apparaissant après un repas ou au réveil, souvent calmés dès le change.",
        quickTips: [
          'Vérifiez si la couche est mouillée, souillée ou trop serrée.',
          'Nettoyez délicatement et vérifiez toute rougeur du siège.',
          'Appliquez une crème protectrice si la peau paraît irritée.',
        ],
      },
      gas_colic: {
        label: 'Gaz et coliques',
        description: "Cris souvent intenses ou aigus, par vagues soudaines, avec bébé qui replie les jambes sur le ventre.",
        quickTips: [
          'Portez bébé à plat ventre sur votre avant-bras ou verticalement contre votre épaule pour faciliter un rot.',
          'Massez doucement le ventre dans le sens des aiguilles d’une montre.',
          'Faites de doux mouvements de pédalage avec ses jambes.',
        ],
      },
      comfort_holding: {
        label: "Besoin d'être porté ou rassuré",
        description: "Pleurs ou appels qui s'apaisent rapidement au contact, à la voix douce ou en peau à peau.",
        quickTips: [
          'Prenez bébé contre vous en peau à peau ou en portage.',
          'Parlez ou fredonnez doucement d’une voix grave et calme.',
          'Offrez une présence apaisante sans surstimulation.',
        ],
      },
      pain: {
        label: 'Possible douleur',
        description: "Cris aigus, soudains, perçants et prolongés qui contrastent avec les pleurs habituels.",
        quickTips: [
          'Inspectez la peau, les doigts, les orteils (cheveu enroulé) et les oreilles.',
          'Prenez la température du bébé et observez son comportement général.',
          'En cas de doute, de pleurs inconsolables ou de fièvre, contactez votre pédiatre.',
        ],
      },
      temperature: {
        label: 'Température inconfortable',
        description: 'Gémissements ou pleurs persistants liés à un excès de chaleur ou à une sensation de froid.',
        quickTips: [
          'Touchez la nuque ou le torse (pas seulement les mains) : elle doit être tiède et sèche.',
          'Retirez ou ajoutez une couche de vêtement légère (température idéale de chambre : 18-20 °C).',
          'En cas de fièvre >= 38 °C, surtout avant 3 mois, consultez sans attendre.',
        ],
      },
      unusual: {
        label: 'Pleurs inhabituels ou difficiles à interpréter',
        description: 'Son atypique, faible, très aigu ou enregistrement trop bruité pour une hypothèse claire.',
        quickTips: [
          'Rapprochez le téléphone dans un environnement plus calme et réessayez si bébé pleure encore.',
          "Observez l'état général : teint, respiration, tonus et prise alimentaire.",
          'Si ce pleur vous paraît vraiment inhabituel ou vous inquiète, demandez un avis médical.',
        ],
      },
    },
    traits: {
      groaning: { label: 'Gémissements', description: 'Vocalisations basses et plaintives, fréquentes lors de fatigue ou gêne.' },
      high_pitched: { label: 'Cris aigus', description: 'Fréquence élevée (> 530 Hz), souvent liée à un inconfort intense, gaz ou douleur.' },
      continuous: { label: 'Pleurs continus', description: 'Émission soutenue avec peu de pauses entre les inspirations.' },
      intermittent: { label: 'Pleurs intermittents', description: 'Alternance de courtes salves et de pauses silencieuses.' },
      intense: { label: 'Pleurs intenses', description: 'Volume sonore élevé et forte énergie acoustique.' },
      weak: { label: 'Pleurs faibles', description: 'Faible intensité sonore ; à surveiller si associé à une grande fatigue.' },
      sudden_change: { label: 'Changement soudain', description: 'Montée brusque de volume ou de hauteur tonale dans l’enregistrement.' },
    },
    safetyFlags: {
      breathing_difficulty: {
        label: 'Difficulté à respirer',
        detail: 'Respiration très rapide, creusement des côtes, pauses respiratoires ou sifflement.',
      },
      bluish_skin: {
        label: 'Coloration bleutée ou grisâtre des lèvres ou de la peau',
        detail: 'Pâleur extrême, teint grisâtre ou bleuté autour de la bouche.',
      },
      hard_to_wake: {
        label: 'Bébé inhabituellement difficile à réveiller',
        detail: 'Somnolence extrême, hypotonie (bébé tout mou) ou absence de réaction.',
      },
      fever_under_3m: {
        label: 'Fièvre >= 38 °C chez un bébé de moins de 3 mois',
        detail: 'Toute fièvre chez un nourrisson de moins de 3 mois est une urgence pédiatrique.',
      },
      unusual_general_state: {
        label: 'Pleurs inhabituels avec état général inquiétant',
        detail: 'Refus total de s’alimenter, vomissements répétés, pleurs inconsolables inhabituels.',
      },
    },
  },
  en: {
    brandName: 'BABYCRY AI',
    brandSubtitle: 'Intelligence that understands baby cries',
    nav: {
      home: 'Home',
      record: 'Record',
      history: 'History',
      guides: 'Guides',
      settings: 'Settings',
      profile: 'Baby Profile',
    },
    consent: {
      title: 'Welcome to BABYCRY AI',
      subtitle:
        'A calm parenting companion to help interpret your baby’s cries with full respect for family privacy.',
      bulletAudio:
        'Baby audio recordings are sensitive data: audio is only captured and analyzed with your explicit consent.',
      bulletEncryption:
        'AES-256-GCM encryption at rest, limited retention period, and permanent deletion available at any moment.',
      bulletMedical:
        'BABYCRY AI provides acoustic hypotheses with a model confidence score. It never replaces a pediatrician.',
      bulletCommercial:
        'Zero commercial use of recordings without your explicit authorization.',
      checkboxLabel:
        'I am the parent or legal guardian and I consent to audio recording and AI analysis under the privacy policy.',
      datasetOptInLabel:
        'Optional: allow anonymized acoustic metrics (no raw audio or name) when I confirm an outcome to improve model accuracy.',
      acceptCta: 'Start safely',
      viewPolicy: 'Read privacy policy',
    },
    home: {
      heroTitle: 'Listen and understand what your baby may need',
      heroDescription:
        'Record a few seconds of crying to receive clear hypotheses, observed acoustic traits, and practical age-adapted parenting tips.',
      recordCta: 'RECORD CRIES',
      uploadShortcut: 'Upload audio file',
      activeBabyLabel: 'Active profile',
      noBabyTitle: 'Create your baby’s profile',
      noBabyDesc:
        'Add your baby’s name and birth date so soothing tips and pediatric safety rules adapt to their exact age.',
      createProfileCta: 'Create baby profile',
      editProfileCta: 'Edit profile',
      safetyBannerTitle: 'Medical Warning Signs',
      safetyBannerDesc:
        'Trouble breathing, bluish/grayish lips, unusually hard to wake, or fever >= 38°C under 3 months? Seek urgent medical care.',
      safetyBannerCta: 'Check warning signs',
      latestInsightTitle: 'Latest analysis',
      noHistoryYet: 'No recordings analyzed yet. Tap “RECORD CRIES” to begin.',
      viewAllHistory: 'View full history',
      ageTipTitle: 'Age-adapted focus',
    },
    profile: {
      title: 'Baby Profile',
      subtitle: 'Tips and pediatric safety thresholds automatically adapt to your baby’s exact age.',
      addNew: 'New profile',
      nameLabel: 'First name or nickname',
      namePlaceholder: 'e.g., Leo, Maya...',
      birthDateLabel: 'Birth date',
      feedingLabel: 'Current feeding method',
      notesLabel: 'Optional helpful notes (reflux, prematurity, routine)',
      notesPlaceholder: 'e.g., mild reflux after feeds, last fed 2h ago...',
      saveCta: 'Save profile',
      cancelCta: 'Cancel',
      deleteCta: 'Delete profile',
      activeTag: 'Active profile',
      selectCta: 'Select',
      ageLabel: 'Calculated age',
      stageAdviceLabel: 'Stage-specific guidance',
      validationName: 'Please enter a name or nickname.',
      validationDate: 'Please select a valid birth date.',
      savedToast: 'Profile saved and encrypted.',
    },
    feedingTypes: {
      breastfeeding: 'Breastfeeding',
      formula: 'Formula bottle',
      mixed: 'Mixed feeding',
      solids: 'Solid foods started',
    },
    record: {
      title: 'Cry Recording',
      subtitle: 'Hold your phone about 30–50 cm from your baby in a quiet room.',
      safetyCheckTitle: 'Quick Pediatric Safety Check (before analysis)',
      safetyCheckDesc:
        'Check any sign present right now. If an urgent sign is present, medical evaluation comes first.',
      temperatureLabel: 'Measured temperature (optional, °C)',
      temperaturePlaceholder: 'e.g., 37.2',
      emergencyTitle: 'Urgent Medical Evaluation Recommended',
      emergencyDesc:
        'One or more warning signs were selected. Do not continue audio analysis: contact your pediatrician or local emergency services immediately.',
      emergencyActionPrimary: 'View safety guidelines',
      emergencyClearBtn: 'Reset check (none of these signs are present)',
      mainButtonStart: 'RECORD CRIES',
      mainButtonStop: 'STOP & ANALYZE',
      recordingStatus: 'Capturing live audio & spectrum...',
      readyStatus: 'Ready to listen',
      contextNoteLabel: 'Quick context (optional)',
      contextNotePlaceholder: 'e.g., awake for 90 min, last fed 3 hours ago...',
      uploadLabel: 'Or upload an audio file (.wav, .mp3, .webm, .ogg)',
      uploadHint: 'Real acoustic DSP extraction followed by Google AI multimodal analysis',
      testLabTitle: 'Real Acoustic Demonstration Samples (16 kHz WAV)',
      testLabDesc:
        'If no microphone is attached, generate a real WAV acoustic waveform and run it through the DSP + Google AI pipeline:',
      testSampleHunger: 'Rhythmic signal (hunger-like)',
      testSamplePain: 'Sudden high-pitched signal (pain/gas-like)',
      testSampleFatigue: 'Low soft signal (fatigue-like)',
      testSampleSilence: 'Quiet room noise (rejection test)',
      analyzeLoadedBtn: 'Run AI analysis on this audio',
      micErrorTitle: 'Microphone unavailable',
      micErrorFallback: 'You can upload an audio file or test with a real WAV acoustic sample below.',
      analyzingTitle: 'Analyzing acoustic patterns & AI...',
      analyzingStep1: 'Extracting acoustic DSP features (pitch Hz, loudness dB, cry bursts)',
      analyzingStep2: 'Detecting cry cadence and sudden vocal shifts',
      analyzingStep3: 'Interpreting with Google AI multimodal audio model',
    },
    results: {
      title: 'Analysis Results',
      primaryLabel: 'Most likely interpretation (hypothesis)',
      otherPossibilities: 'Other possible interpretations',
      modelConfidenceLabel: 'Model confidence',
      confidenceDisclaimer:
        'This percentage reflects the model’s confidence in its audio classification, not a confirmed medical probability.',
      durationLabel: 'Recording duration',
      observedTraitsLabel: 'Observed vocal characteristics',
      acousticMetricsLabel: 'Extracted acoustic metrics',
      pitchLabel: 'Fundamental pitch',
      loudnessLabel: 'Average loudness (RMS)',
      burstsLabel: 'Cry bursts',
      suddenShiftYes: 'Sudden shift detected',
      suddenShiftNo: 'Steady progression',
      explanationLabel: 'Simple explanation',
      practicalTipsLabel: 'Practical age-adapted tips',
      audioPlaybackLabel: 'Listen to recording (decrypted on demand)',
      medicalSafetyTitle: 'Important Medical Notice',
      medicalNeverReplaces:
        'BABYCRY AI never replaces a pediatrician and can never confirm that a baby is healthy solely from their cry.',
      inconclusiveBadge: 'Inconclusive audio / no clear infant cry detected',
      feedbackTitle: 'Help refine hypotheses',
      feedbackDesc: 'What ultimately helped soothe your baby?',
      feedbackHelpfulYes: 'Helpful',
      feedbackHelpfulNo: 'Not helpful',
      feedbackCategoryLabel: 'Observed real cause',
      feedbackSubmit: 'Save feedback',
      feedbackSaved: 'Thank you! Your feedback has been saved.',
      recordAnotherCta: 'Record again',
      backToHistoryCta: 'View history',
      gauge: {
        title: 'Confidence Gauge & Historical Benchmark',
        currentLabel: 'This analysis',
        historicalAvgLabel: 'Historical average',
        sourceUserHistory: 'Your past recordings',
        sourceModelBaseline: 'Model reference benchmark',
        tierAbove: 'Above average',
        tierOnPar: 'On par with average',
        tierBelow: 'Below average',
        deltaLabel: 'Difference',
        refinementTitle: 'How contributing refines this category',
        categorySamplesLabel: 'Anonymized contributions in this category',
        impactLabels: {
          high: 'High refinement value',
          medium: 'Steady reinforcement',
          calibration: 'Calibration anchor',
          low: 'Unclear audio for training',
        },
        reasons: {
          inconclusive_audio:
            'Because no clear infant cry was detected, this recording is excluded from category refinement.',
          underrepresented_category:
            'This category still has few confirmed samples: your confirmation directly improves detection recall for this cry type.',
          ambiguous_boundary:
            'The runner-up hypothesis is close in score: confirming the true outcome sharpens the acoustic boundary between overlapping categories.',
          below_average_edge_case:
            'Model confidence is below the historical average: borderline recordings are especially valuable for improving robustness.',
          strong_anchor:
            'Clear acoustic signature with high confidence: your confirmation anchors prototype accuracy and probability calibration.',
          balanced_reinforcement:
            'Your anonymized feedback helps verify consistency across infant age stages.',
        },
        optInActiveNote:
          'Anonymized contribution is active: submitting feedback below logs only de-identified DSP metrics (never raw audio or name) to refine this category.',
        optInInactiveNote:
          'Anonymized contribution is currently off. You can enable it so your feedback helps refine this category (no raw audio is ever shared).',
        enableOptInBtn: 'Enable anonymized contribution',
        submittedNote: 'Feedback recorded for this analysis.',
      },
    },
    history: {
      title: 'History & Sound Evolution',
      subtitle: 'Review past analyses, track acoustic patterns over time, and delete recordings anytime.',
      filterAllBabies: 'All babies',
      filterAllCategories: 'All categories',
      evolutionTitle: 'Cry evolution over time',
      evolutionDesc: 'Sound intensity (dB), pitch (Hz), and category patterns across recordings.',
      categoryDistributionTitle: 'Hypothesis breakdown',
      emptyTitle: 'No recordings saved yet',
      emptyDesc: 'Your analyzed cries will appear here with timestamps, acoustic traits, and tips.',
      emptyCta: 'Record first cry',
      deleteConfirm: 'Permanently delete this recording and its encrypted audio file?',
      deleteBtn: 'Delete',
      inspectBtn: 'View details',
      playBtn: 'Play',
      pauseBtn: 'Pause',
      expiresLabel: 'Auto-expires',
    },
    guides: {
      title: 'Parenting Guides & AI Transparency',
      subtitle: 'Understand the 9 cry categories, vocal traits, pediatric safety signs, and how the AI model works.',
      categoriesTitle: 'The 9 Analyzed Cry Categories',
      traitsTitle: 'Distinct Vocal Characteristics',
      safetySectionTitle: 'When to Seek Urgent Pediatric Care',
      safetySectionDesc:
        'If you notice any of the following warning signs, stop audio analysis and seek immediate medical evaluation:',
      aiModelTitle: 'How BABYCRY AI Works',
      aiModelDesc:
        'The pipeline pairs real DSP acoustic feature extraction (fundamental pitch f0, RMS dB, burst segmentation, sudden intensity shifts) with Google AI multimodal audio analysis (gemini-4-hydrogen). It strictly presents hypotheses and marks unclear audio as inconclusive.',
      specializedModelTitle: 'Integrating & Testing a Specialized Infant Cry Classifier',
      specializedModelSteps: [
        'Plug in a dedicated classifier via the server CRY_CLASSIFIER_ENDPOINT environment variable (JSON POST with audioBase64 + DSP features).',
        'Use legally obtained, ethics-approved corpora (such as Donate-a-Cry or BabyChillanto) with explicit caregiver authorization.',
        'Train Log-Mel spectrogram / MFCC models (CNN, AST, or fine-tuned YAMNet) and validate F1-score per age bracket before deployment.',
        'Optional caregiver feedback stores only anonymized DSP feature vectors (no raw audio or PII) for ongoing threshold calibration.',
      ],
    },
    settings: {
      title: 'Settings & Privacy',
      subtitle: 'Manage language, parental consent, limited retention, and permanent data erasure.',
      languageLabel: 'Application language',
      privacySectionTitle: 'Consent & Ethical Model Improvement',
      consentStatusLabel: 'Explicit parental consent',
      consentGranted: 'Granted',
      consentNotGranted: 'Not granted',
      datasetToggleLabel: 'Anonymized contribution to model improvement',
      datasetToggleDesc:
        'Allow saving anonymized acoustic metrics (never raw audio or baby name) when submitting feedback.',
      datasetCountLabel: 'Anonymized contributions saved',
      retentionLabel: 'Limited retention period',
      retentionOptions: [
        { value: 0, label: 'Delete immediately after analysis' },
        { value: 7, label: '7 days maximum' },
        { value: 30, label: '30 days maximum' },
        { value: 90, label: '90 days maximum' },
      ],
      encryptionTitle: 'Active Encryption & Security',
      encryptionDesc:
        'Audio files and sensitive profile notes are encrypted at rest on the server using AES-256-GCM. Zero commercial sharing.',
      policyTitle: 'Clear Privacy Policy',
      policyBody: [
        '1. Strict Purpose: recordings are processed solely to help caregivers understand infant cries.',
        '2. Explicit Consent: no audio recording or analysis runs without clear parental agreement.',
        '3. Encryption & Limited Retention: audio blobs use AES-256-GCM encryption and auto-purge after your chosen retention period.',
        '4. Full Control: permanently delete any single recording or wipe all data in one action.',
        '5. Zero Commercial Use: recordings are never sold, shared for ads, or monetized.',
      ],
      eraseAllTitle: 'Permanent Data Erasure',
      eraseAllDesc:
        'Immediately removes all baby profiles, encrypted audio files, analysis history, and resets consent.',
      eraseAllBtn: 'Permanently delete all data',
      eraseAllConfirmBtn: 'Confirm permanent deletion',
      eraseCancelBtn: 'Cancel',
      savedMessage: 'Settings updated.',
    },
    categories: {
      hunger: {
        label: 'Possible Hunger',
        description: 'Often rhythmic cries that build steadily, frequently paired with rooting or fist-sucking.',
        quickTips: [
          'Check when the baby last fed.',
          'Look for early hunger cues: rooting, sucking fingers, lip smacking.',
          'Feed in a calm, unhurried position.',
        ],
      },
      fatigue: {
        label: 'Fatigue & Sleepiness',
        description: 'Often intermittent, lower-pitched whimpering or groaning that rises and fades.',
        quickTips: [
          'Dim the lights and lower background noise.',
          'Watch for yawning, eye rubbing, or staring off.',
          'Gently rock or place baby on their back in a safe crib.',
        ],
      },
      discomfort: {
        label: 'Physical Discomfort',
        description: 'Steady moderate crying triggered by tight clothing, awkward posture, tags, or harsh light.',
        quickTips: [
          'Check for tight elastic, scratchy tags, or hair wrapped around fingers/toes.',
          'Gently adjust baby’s posture.',
          'Reduce bright lighting or sudden noise.',
        ],
      },
      diaper: {
        label: 'Wet or Soiled Diaper',
        description: 'Fussy, persistent crying often following feeds or waking, easing once changed.',
        quickTips: [
          'Check if the diaper is wet, soiled, or fastened too tightly.',
          'Clean gently and inspect for diaper rash.',
          'Apply barrier cream if skin looks irritated.',
        ],
      },
      gas_colic: {
        label: 'Gas & Colic',
        description: 'Intense, sudden waves of higher-pitched crying, often with knees pulled toward the belly.',
        quickTips: [
          'Hold baby upright against your shoulder or tummy-down along your forearm to burp.',
          'Gently massage the belly clockwise.',
          'Try slow bicycle leg movements.',
        ],
      },
      comfort_holding: {
        label: 'Need to Be Held or Reassured',
        description: 'Crying or fussing that settles quickly when held close, rocked, or spoken to softly.',
        quickTips: [
          'Offer skin-to-skin contact or calm holding.',
          'Speak or hum softly in a steady rhythm.',
          'Keep stimulation gentle and reassuring.',
        ],
      },
      pain: {
        label: 'Possible Pain',
        description: 'Sharp, high-pitched, sudden intense cries that sound different from routine fussing.',
        quickTips: [
          'Check skin, fingers, toes, and ears for visible irritation.',
          'Measure temperature and observe overall alertness.',
          'If inconsolable, feverish, or unusual, contact a pediatrician.',
        ],
      },
      temperature: {
        label: 'Uncomfortable Temperature',
        description: 'Persistent fussing or groaning from feeling too warm or too cold.',
        quickTips: [
          'Feel the back of the neck or chest (not just hands): it should feel warm and dry.',
          'Add or remove one light layer (ideal room temperature: 18–20°C / 65–68°F).',
          'If fever >= 38°C occurs (especially under 3 months), seek urgent care.',
        ],
      },
      unusual: {
        label: 'Unusual or Hard to Interpret',
        description: 'Atypical, very weak, shrill, or unclear audio where no standard pattern fits cleanly.',
        quickTips: [
          'Move closer in a quieter room and record again if crying continues.',
          'Observe color, breathing effort, feeding, and responsiveness.',
          'If the cry sounds genuinely unusual or worries you, consult a doctor.',
        ],
      },
    },
    traits: {
      groaning: { label: 'Groaning', description: 'Low, plaintive vocalizations common with tiredness or mild discomfort.' },
      high_pitched: { label: 'High-pitched cries', description: 'Elevated pitch (> 530 Hz), often associated with sharp discomfort, gas, or pain.' },
      continuous: { label: 'Continuous crying', description: 'Sustained vocalization with minimal pauses between breaths.' },
      intermittent: { label: 'Intermittent crying', description: 'Alternating short cry bursts and quiet pauses.' },
      intense: { label: 'Intense crying', description: 'High acoustic energy and loud peak amplitude.' },
      weak: { label: 'Weak crying', description: 'Low volume and energy; monitor alertness closely.' },
      sudden_change: { label: 'Sudden cry shift', description: 'Abrupt jump in intensity or pitch during the recording.' },
    },
    safetyFlags: {
      breathing_difficulty: {
        label: 'Trouble breathing',
        detail: 'Fast breathing, ribs pulling in, breathing pauses, or wheezing.',
      },
      bluish_skin: {
        label: 'Bluish or grayish lips or skin',
        detail: 'Extreme paleness or bluish/grayish tint around the mouth or skin.',
      },
      hard_to_wake: {
        label: 'Unusually difficult to wake',
        detail: 'Extreme drowsiness, limpness, or poor responsiveness.',
      },
      fever_under_3m: {
        label: 'Fever >= 38°C (100.4°F) under 3 months',
        detail: 'Any fever in an infant under 3 months is a pediatric emergency.',
      },
      unusual_general_state: {
        label: 'Unusual cry with concerning general state',
        detail: 'Refusal to feed, repeated vomiting, or unusual inconsolable distress.',
      },
    },
  },
  ht: {
    brandName: 'BABYCRY AI',
    brandSubtitle: 'Entèlijans ki konprann kriye tibebe',
    nav: {
      home: 'Akèy',
      record: 'Anrejistre',
      history: 'Istorik',
      guides: 'Konsèy',
      settings: 'Paramèt',
      profile: 'Pwofil tibebe',
    },
    consent: {
      title: 'Byenvini sou BABYCRY AI',
      subtitle:
        'Yon asistan kalm pou ede paran yo konprann sa kriye tibebe a ka vle di, toutpandan l ap pwoteje vi prive nou.',
      bulletAudio:
        'Anrejistreman vwa tibebe se done sansib : yo analize sèlman ak konsantman klè ou.',
      bulletEncryption:
        'Chifreman AES-256-GCM sou sèvè a, tan konsèvasyon limite, epi posiblite pou efase tout bagay nenpòt ki lè.',
      bulletMedical:
        'BABYCRY AI bay ipotèz akoustik ak yon nivo konfyans. Li pa janm ranplase yon pedyat.',
      bulletCommercial:
        'Pa gen okenn itilizasyon komèsyal san otorizasyon klè ou.',
      checkboxLabel:
        'Mwen se paran an oswa responsab legal la epi mwen dakò ak anrejistreman ak analiz odyo selon règleman konfidansyalite a.',
      datasetOptInLabel:
        'Opsyonèl : pèmèt voye mezi akoustik anonim (san odyo ni non) lè m konfime yon kòz pou amelyore modèl la.',
      acceptCta: 'Kòmanse an sekirite',
      viewPolicy: 'Li règleman konfidansyalite a',
    },
    home: {
      heroTitle: 'Koute epi konprann sa tibebe w la ka bezwen',
      heroDescription:
        'Anrejistre kèk segonn kriye pou jwenn ipotèz klè, detay son yo, ak konsèy pratik ki adapte ak laj tibebe a.',
      recordCta: 'ANREJISTRE KRIYE YO',
      uploadShortcut: 'Chaje yon fichye odyo',
      activeBabyLabel: 'Pwofil aktif',
      noBabyTitle: 'Ajoute pwofil tibebe w la',
      noBabyDesc:
        'Mete ti non li ak dat nesans li pou konsèy yo ak alèt sekirite yo adapte ak laj li egzakteman.',
      createProfileCta: 'Kreye pwofil tibebe',
      editProfileCta: 'Modifye pwofil la',
      safetyBannerTitle: 'Siy danje medikal',
      safetyBannerDesc:
        'Pwoblèm pou respire, bouch ble oswa gri, tibebe difisil pou reveye, oswa lafyèv >= 38 °C anba 3 mwa ? Wè yon doktè touswit.',
      safetyBannerCta: 'Verifye siy yo',
      latestInsightTitle: 'Dènye analiz',
      noHistoryYet: 'Poko gen anrejistreman analize. Peze « ANREJISTRE KRIYE YO » pou kòmanse.',
      viewAllHistory: 'Wè tout istorik la',
      ageTipTitle: 'Konsèy selon laj la',
    },
    profile: {
      title: 'Pwofil Tibebe a',
      subtitle: 'Konsèy ak alèt sekirite yo ajiste otomatikman selon laj tibebe a.',
      addNew: 'Nouvo pwofil',
      nameLabel: 'Non oswa ti non',
      namePlaceholder: 'Egz. Léo, Maya...',
      birthDateLabel: 'Dat nesans',
      feedingLabel: 'Jan l ap manje',
      notesLabel: 'Enfòmasyon opsyonèl itil (rifli, prematire, abitid)',
      notesPlaceholder: 'Egz. ti rifli apre tete, dènye repa gen 2 èdtan...',
      saveCta: 'Anrejistre pwofil la',
      cancelCta: 'Anile',
      deleteCta: 'Efase pwofil sa a',
      activeTag: 'Pwofil chwazi',
      selectCta: 'Chwazi',
      ageLabel: 'Laj kalkile',
      stageAdviceLabel: 'Konsèy pou etap laj sa a',
      validationName: 'Tanpri antre yon non oswa ti non.',
      validationDate: 'Tanpri chwazi yon dat nesans ki valab.',
      savedToast: 'Pwofil anrejistre epi chifre.',
    },
    feedingTypes: {
      breastfeeding: 'Tete manman',
      formula: 'Lèt nan bibwon',
      mixed: 'Tete ak bibwon',
      solids: 'Manje solid kòmanse',
    },
    record: {
      title: 'Anrejistreman kriye',
      subtitle: 'Kenbe telefòn nan a anviwon 30–50 cm de tibebe a nan yon kote ki kalm.',
      safetyCheckTitle: 'Verifikasyon sekirite pedyatrik rapid (anvan analiz)',
      safetyCheckDesc:
        'Koche si ou wè youn nan siy sa yo kounye a. Si gen danje, swen medikal pase anvan tout bagay.',
      temperatureLabel: 'Tanperati mezire (opsyonèl, °C)',
      temperaturePlaceholder: 'Egz. 37.2',
      emergencyTitle: 'Evalyasyon medikal ijan rekòmande',
      emergencyDesc:
        'Ou siyalize youn oswa plizyè siy enkyetan. Pa kontinye analiz odyo a : kontakte pedyat ou oswa ale nan sèvis ijans touswit.',
      emergencyActionPrimary: 'Wè konsèy sekirite yo',
      emergencyClearBtn: 'Reyinisyalize (okenn nan siy sa yo pa la)',
      mainButtonStart: 'ANREJISTRE KRIYE YO',
      mainButtonStop: 'KANPE EPI ANALIZE',
      recordingStatus: 'Anrejistreman odyo ak frekans ap fèt...',
      readyStatus: 'Pare pou koute',
      contextNoteLabel: 'Kontèks rapid (opsyonèl)',
      contextNotePlaceholder: 'Egz. reveye depi 1h30, dènye bibwon gen 3h...',
      uploadLabel: 'Oswa chaje yon fichye odyo (.wav, .mp3, .webm, .ogg)',
      uploadHint: 'Ekstraksyon akoustik reyèl ak analiz Google AI',
      testLabTitle: 'Echantiyon akoustik reyèl pou tès (WAV 16 kHz)',
      testLabDesc:
        'Si pa gen mikwofòn konekte, ou ka kreye yon siyal WAV reyèl pou teste motè DSP + Google AI la :',
      testSampleHunger: 'Siyal ritmik (tip grangou)',
      testSamplePain: 'Siyal egi brital (tip doulè/gaz)',
      testSampleFatigue: 'Siyal ba dous (tip fatig)',
      testSampleSilence: 'Bri kalm nan chanm (tès rejè)',
      analyzeLoadedBtn: 'Lanse analiz IA sou odyo sa a',
      micErrorTitle: 'Mikwofòn pa disponib',
      micErrorFallback: 'Ou ka chaje yon fichye odyo oswa itilize yon echantiyon WAV reyèl anba a.',
      analyzingTitle: 'Analiz akoustik ak IA ap fèt...',
      analyzingStep1: 'Ekstraksyon karakteristik son yo (frekans Hz, fòs dB, vag kriye)',
      analyzingStep2: 'Deteksyon ritm kriye yo ak chanjman brital',
      analyzingStep3: 'Entèpretasyon ak modèl odyo Google AI',
    },
    results: {
      title: 'Rezilta analiz la',
      primaryLabel: 'Entèpretasyon ki pi pwobab (ipotèz)',
      otherPossibilities: 'Lòt entèpretasyon posib',
      modelConfidenceLabel: 'Konfyans modèl la',
      confidenceDisclaimer:
        'Pousantaj sa a reprezante konfyans modèl la nan klasifikasyon odyo li, se pa yon pwobabilite medikal konfime.',
      durationLabel: 'Dire anrejistreman an',
      observedTraitsLabel: 'Karakteristik son yo obsève',
      acousticMetricsLabel: 'Mezi akoustik yo jwenn',
      pitchLabel: 'Frekans fondamantal',
      loudnessLabel: 'Fòs son mwayèn (RMS)',
      burstsLabel: 'Vag kriye detekte',
      suddenShiftYes: 'Chanjman brital detekte',
      suddenShiftNo: 'Evolisyon regilye',
      explanationLabel: 'Eksplikasyon senp',
      practicalTipsLabel: 'Konsèy pratik adapte ak laj la',
      audioPlaybackLabel: 'Rekoute anrejistreman an (dechifre lè w mande l)',
      medicalSafetyTitle: 'Rapèl medikal enpòtan',
      medicalNeverReplaces:
        'BABYCRY AI pa janm ranplase yon pedyat epi li pa janm ka di yon tibebe an sante sèlman sou baz kriye li.',
      inconclusiveBadge: 'Siyal pa klè / pa gen kriye tibebe ki klè detekte',
      feedbackTitle: 'Ede amelyore ipotèz yo',
      feedbackDesc: 'Ki sa ki te finalman kalme tibebe a ?',
      feedbackHelpfulYes: 'Itil',
      feedbackHelpfulNo: 'Pa t twò itil',
      feedbackCategoryLabel: 'Vrè kòz ou obsève',
      feedbackSubmit: 'Anrejistre repons mwen',
      feedbackSaved: 'Mèsi ! Repons ou anrejistre.',
      recordAnotherCta: 'Nouvo anrejistreman',
      backToHistoryCta: 'Wè istorik la',
      gauge: {
        title: 'Kalib konfyans ak mwayèn istorik',
        currentLabel: 'Analiz sa a',
        historicalAvgLabel: 'Mwayèn istorik',
        sourceUserHistory: 'Ansyen analiz ou yo',
        sourceModelBaseline: 'Referans baz modèl la',
        tierAbove: 'Pi wo pase mwayèn nan',
        tierOnPar: 'Nan mwayèn nan',
        tierBelow: 'Pi ba pase mwayèn nan',
        deltaLabel: 'Diferans',
        refinementTitle: 'Kijan kontribisyon w lan amelyore kategori sa a',
        categorySamplesLabel: 'Kontribisyon anonim pou kategori sa a',
        impactLabels: {
          high: 'Gwo valè pou amelyorasyon',
          medium: 'Ranfòsman itil',
          calibration: 'Referans kalibrasyon',
          low: 'Son an pa klè pou antrènman',
        },
        reasons: {
          inconclusive_audio:
            'Pa gen kriye klè nan anrejistreman sa a : li pa rekòmande pou antrene kategori a.',
          underrepresented_category:
            'Kategori sa a poko gen anpil egzanp konfime : repons ou an ede modèl la rekonèt tip kriye sa a pi byen.',
          ambiguous_boundary:
            'Dezyèm ipotèz la trè pre premye a : lè w konfime vrè kòz la, modèl la aprann separe de son ki sanble yo.',
          below_average_edge_case:
            'Konfyans lan pi ba pase mwayèn nan : ka difisil sa yo gen anpil valè pou rann modèl la pi solid.',
          strong_anchor:
            'Siyal klè ak bon nivo konfyans : konfimasyon w lan ranfòse presizyon ak kalibrasyon pousantaj yo.',
          balanced_reinforcement:
            'Fidbak anonim ou an ede verifye estabilite kategori sa a selon laj tibebe a.',
        },
        optInActiveNote:
          'Kontribisyon anonim aktive : lè w voye repons ou anba a, sèlman mezi akoustik anonim (jamè odyo ni non) ap rafine kategori sa a.',
        optInInactiveNote:
          'Kontribisyon anonim dezaktive kounye a. Ou ka aktive l pou fidbak ou ede rafine kategori sa a (pa gen okenn odyo ki pataje).',
        enableOptInBtn: 'Otorize kontribisyon anonim',
        submittedNote: 'Repons ou anrejistre pou analiz sa a.',
      },
    },
    history: {
      title: 'Istorik ak evolisyon',
      subtitle: 'Gade ansyen analiz yo, swiv chanjman son yo nan tan, epi efase yo nenpòt ki lè.',
      filterAllBabies: 'Tout tibebe yo',
      filterAllCategories: 'Tout kategori yo',
      evolutionTitle: 'Evolisyon kriye yo nan tan',
      evolutionDesc: 'Fòs son (dB), frekans (Hz) ak repatisyon ipotèz ki sot pase yo.',
      categoryDistributionTitle: 'Repatisyon ipotèz yo',
      emptyTitle: 'Poko gen anrejistreman',
      emptyDesc: 'Analiz ou yo ap parèt la a ak dat, lè, detay son yo ak konsèy.',
      emptyCta: 'Anrejistre premye kriye a',
      deleteConfirm: 'Efase anrejistreman sa a ak fichye odyo chifre li nèt ?',
      deleteBtn: 'Efase',
      inspectBtn: 'Wè detay',
      playBtn: 'Koute',
      pauseBtn: 'Poz',
      expiresLabel: 'Ekspirasyon oto',
    },
    guides: {
      title: 'Konsèy pou Paran & IA',
      subtitle: 'Konprann 9 kategori kriye yo, siy vokal yo, sekirite pedyatrik ak jan modèl la fonksyone.',
      categoriesTitle: '9 Kategori Kriye yo Analize',
      traitsTitle: 'Siyati Son Patikilye',
      safetySectionTitle: 'Kilè pou w Wè yon Doktè Touswit',
      safetySectionDesc:
        'Si ou wè youn nan siy sa yo, kanpe analiz odyo a epi chèche swen medikal ijan :',
      aiModelTitle: 'Kijan BABYCRY AI Fonksyone ?',
      aiModelDesc:
        'Sistèm nan mete ansanm analiz akoustik DSP reyèl (frekans f0, fòs dB, vag kriye, chanjman brital) ak modèl odyo Google AI (gemini-4-hydrogen). Li bay sèlman ipotèz epi li refize envante yon repons si pa gen kriye klè.',
      specializedModelTitle: 'Entegre ak teste yon modèl espesyalize pou kriye tibebe',
      specializedModelSteps: [
        'Konekte yon klasifikatè espesyalize atravè varyab sèvè CRY_CLASSIFIER_ENDPOINT (JSON POST ak audioBase64 + mezi DSP).',
        'Itilize baz done legal ak otorize sèlman (tankou Donate-a-Cry oswa BabyChillanto) ak pèmisyon paran yo.',
        'Antrene modèl Log-Mel / MFCC (CNN, AST oswa YAMNet) epi evalye F1-score pou chak laj tibebe.',
        'Repons paran yo ki gen pèmisyon anrejistre sèlman mezi DSP anonim (pa gen odyo ni non) pou amelyore presizyon an.',
      ],
    },
    settings: {
      title: 'Paramèt ak Konfidansyalite',
      subtitle: 'Chwazi lang ou, jere konsantman, tan konsèvasyon ak efasman tout done yo.',
      languageLabel: 'Lang aplikasyon an',
      privacySectionTitle: 'Konsantman ak Amelyorasyon Etik',
      consentStatusLabel: 'Konsantman klè paran an',
      consentGranted: 'Akòde',
      consentNotGranted: 'Pa akòde',
      datasetToggleLabel: 'Kontribisyon anonim pou amelyore modèl la',
      datasetToggleDesc:
        'Pèmèt sove mezi akoustik anonim sèlman (jamè odyo ni non tibebe) lè w voye fidbak.',
      datasetCountLabel: 'Kontribisyon anonim anrejistre',
      retentionLabel: 'Tan konsèvasyon limite',
      retentionOptions: [
        { value: 0, label: 'Efase touswit apre analiz la' },
        { value: 7, label: '7 jou maksimòm' },
        { value: 30, label: '30 jou maksimòm' },
        { value: 90, label: '90 jou maksimòm' },
      ],
      encryptionTitle: 'Chifreman ak Sekirite Aktif',
      encryptionDesc:
        'Fichye odyo ak nòt pwofil yo chifre sou sèvè a ak AES-256-GCM. Pa gen okenn pataj komèsyal.',
      policyTitle: 'Règ Konfidansyalite Klè',
      policyBody: [
        '1. Objektif strik : anrejistreman yo sèvi sèlman pou ede paran konprann kriye tibebe yo.',
        '2. Konsantman klè : okenn analiz odyo pa fèt san akò paran an.',
        '3. Chifreman & tan limite : odyo yo chifre ak AES-256-GCM epi yo efase otomatikman apre delè ou chwazi a.',
        '4. Kontwòl total : ou ka efase yon sèl anrejistreman oswa tout done yo nèt ak yon sèl klik.',
        '5. Zewo itilizasyon komèsyal : yo pa janm vann ni pataje odyo yo pou piblisite.',
      ],
      eraseAllTitle: 'Efase Tout Done yo Nèt',
      eraseAllDesc:
        'Efase touswit tout pwofil tibebe, tout odyo chifre, tout istorik epi reyinisyalize konsantman an.',
      eraseAllBtn: 'Efase tout done yo nèt',
      eraseAllConfirmBtn: 'Konfime efasman total la',
      eraseCancelBtn: 'Anile',
      savedMessage: 'Paramèt yo mete ajou.',
    },
    categories: {
      hunger: {
        label: 'Posib Grangou',
        description: 'Kriye souvan ritmik ki monte piti piti, pafwa ak tibebe k ap souse pwen li.',
        quickTips: [
          'Verifye lè tibebe a te pran dènye tete oswa bibwon li.',
          'Gade siy bonè yo : li chèche tete, souse dwèt li, vire tèt li.',
          'Enstale l alèz nan kalm pou ba l manje san prese.',
        ],
      },
      fatigue: {
        label: 'Fatig ak Dòmi',
        description: 'Kriye pi dous oswa jemi ki vini pa ti vag epi ki desann.',
        quickTips: [
          'Bese limyè a epi diminye bri nan chanm nan.',
          'Gade si l ap baye oswa si l ap fwote je li.',
          'Bèse l dousman oswa mete l kouche sou do l nan kabann sekirize li.',
        ],
      },
      discomfort: {
        label: 'Malèz Fizik',
        description: 'Kriye kontinyèl mwayen akòz yon rad ki sere, yon move pozisyon oswa yon etikèt ki grate.',
        quickTips: [
          'Verifye si gen rad, chosèt oswa elastik ki sere po l oswa zòtèy li.',
          'Chanje pozisyon tibebe a dousman.',
          'Kontwole limyè fò oswa bri brital.',
        ],
      },
      diaper: {
        label: 'Kouch Sal oswa Mouye',
        description: 'Kriye ajite ki souvan parèt apre repa oswa lè l reveye, epi ki kalme apre chanjman kouch.',
        quickTips: [
          'Verifye si kouch la mouye, sal oswa twò sere.',
          'Netwaye po a dousman epi gade si gen woujè.',
          'Mete yon krèm pwoteksyon si po a parèt irite.',
        ],
      },
      gas_colic: {
        label: 'Gaz ak Kolik',
        description: 'Kriye fò oswa egi ki vini pa gwo vag, ak tibebe k ap rale janm li sou vant li.',
        quickTips: [
          'Kenbe l dwat sou zepòl ou oswa sou vant li sou avanbra ou pou ede l fè ro.',
          'Mase vant li dousman nan sans zegwi mont.',
          'Fè ti mouvman bisiklèt dousman ak janm li.',
        ],
      },
      comfort_holding: {
        label: 'Bezwen Pou Yo Pote L oswa Konsole L',
        description: 'Kriye ki kalme vit lè yo pran l nan bra, po kont po oswa lè yo pale avè l dousman.',
        quickTips: [
          'Pran tibebe a nan bra ou oswa fè kontak po ak po.',
          'Pale oswa fredone yon ti chante dousman.',
          'Ofri yon prezans kalm san twòp bri.',
        ],
      },
      pain: {
        label: 'Posib Doulè',
        description: 'Kriye egi, fò, brital ki pa sanble ak kriye nòmal li yo.',
        quickTips: [
          'Gade po a, dwèt li, zòtèy li (cheve ki vlope) ak zòrèy li.',
          'Pran tanperati tibebe a epi obsève konpòtman jeneral li.',
          'Si kriye a pa vle kanpe oswa gen lafyèv, kontakte pedyat ou.',
        ],
      },
      temperature: {
        label: 'Tanperati Pa Alèz',
        description: 'Jemi oswa kriye ki dire paske li santi twòp chalè oswa twòp fredi.',
        quickTips: [
          'Touche dèyè kou l oswa lestomak li : li dwe tyèd epi sèk.',
          'Ajoute oswa retire yon ti rad lejè (tanperati chanm ideyal : 18–20 °C).',
          'Si li gen lafyèv >= 38 °C, sitou anba 3 mwa, ale wè doktè touswit.',
        ],
      },
      unusual: {
        label: 'Kriye Inabityèl oswa Difisil pou Entèprete',
        description: 'Son etranj, trè fèb, oswa anrejistreman ki gen twòp bri pou yon ipotèz klè.',
        quickTips: [
          'Pwoche telefòn nan nan yon kote ki pi kalm epi eseye ankò.',
          'Obsève koulè po a, respirasyon l ak jan l ap manje.',
          'Si kriye sa a parèt vrèman etranj oswa enkyete w, mande yon doktè konsèy.',
        ],
      },
    },
    traits: {
      groaning: { label: 'Jemi', description: 'Son ba ak plentif, souvan lè tibebe a fatige oswa malalèz.' },
      high_pitched: { label: 'Kriye egi', description: 'Frekans wo (> 530 Hz), souvan lye ak gaz, malèz fò oswa doulè.' },
      continuous: { label: 'Kriye kontinyèl', description: 'Kriye ki dire san anpil poz pou pran souf.' },
      intermittent: { label: 'Kriye entèmitan', description: 'Ti vag kriye ki altène ak moman silans.' },
      intense: { label: 'Kriye entans', description: 'Gwo fòs son ak enèji akoustik wo.' },
      weak: { label: 'Kriye fèb', description: 'Fòs son ba ; siveye vijilans tibebe a byen.' },
      sudden_change: { label: 'Chanjman brital', description: 'Ogmantasyon rapid nan fòs oswa wotè son an.' },
    },
    safetyFlags: {
      breathing_difficulty: {
        label: 'Pwoblèm pou respire',
        detail: 'Respirasyon twò vit, kòt k ap rale anndan, poz respiratwa oswa sifleman.',
      },
      bluish_skin: {
        label: 'Koulè ble oswa gri sou bouch oswa po',
        detail: 'Po trè pal oswa koulè ble/gri alantou bouch la.',
      },
      hard_to_wake: {
        label: 'Tibebe ki difisil pou reveye',
        detail: 'Dòmi twò fon, kò l mou nèt oswa pa gen reyaksyon.',
      },
      fever_under_3m: {
        label: 'Lafyèv >= 38 °C pou tibebe anba 3 mwa',
        detail: 'Nenpòt lafyèv pou yon tibebe anba 3 mwa se yon ijans medikal.',
      },
      unusual_general_state: {
        label: 'Kriye etranj ak eta jeneral enkyetan',
        detail: 'Refize manje nèt, vomisman repete oswa kriye ki pa ka konsole.',
      },
    },
  },
};
