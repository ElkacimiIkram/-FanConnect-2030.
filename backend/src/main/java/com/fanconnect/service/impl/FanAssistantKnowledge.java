package com.fanconnect.service.impl;

final class FanAssistantKnowledge {

    private FanAssistantKnowledge() {
    }

    static String answer(FanAssistantIntent intent) {
        return switch (intent) {
            case GREETING -> "Salut ! Je suis **FanBot**. Je t'aide à trouver un match, un café pas trop plein, et à réserver. "
                    + "Essaie : *Café le plus proche*, *Match du Maroc*, *Comment réserver ?*";
            case HELP -> "Je peux t'aider sur :\n"
                    + "• le café **le plus proche**\n"
                    + "• les matchs **en direct** et le **Maroc**\n"
                    + "• **réserver** une table, **payer**, ticket **QR**\n"
                    + "• l'**occupation** (vert / orange / rouge)\n"
                    + "Pose une question ou tape sur une suggestion.";
            case ABOUT -> "**FanConnect 2030** est une plateforme pour regarder la Coupe du Monde dans un café partenaire : "
                    + "tu choisis le match, tu vois l'affluence en temps réel, tu réserves une table et tu paies en ligne. "
                    + "Cible : fans au **Maroc, Espagne, Portugal**.";
            case BOOKING -> "Pour réserver : 1) choisis un **match** 2) un **café** 3) une **table** 4) paie. "
                    + "Connecte-toi en compte **Fan**, puis clique **Réserver** sur une carte café. "
                    + "Sans compte, tu peux d'abord te créer un profil via Connexion / Inscription.";
            case PAYMENT -> "Le paiement se fait **en ligne par carte (Stripe, mode test)**. "
                    + "Le prix affiché est le tarif **match day** de la table. "
                    + "Après paiement, tu reçois un **ticket QR** dans ton dashboard.";
            case TICKET -> "Ton **ticket QR** est dans **Mon dashboard** après un paiement confirmé. "
                    + "Montre-le au café : le gérant fait le **check-in**. "
                    + "Garde le code jusqu'au match.";
            case OCCUPANCY -> "**Vert** = encore de la place, **orange** = ça se remplit, **rouge** = presque complet. "
                    + "L'IA prédit l'affluence 1h, 2h et au coup d'envoi pour t'éviter d'arriver pile quand c'est plein.";
            case ACCOUNT -> "Deux comptes : **Fan** (réserver) et **Propriétaire** (gérer le café). "
                    + "Inscription → Login. L'admin de démo est `admin@fanconnect.com`.";
            case OWNER -> "Tu as un café ? Inscris-toi en **Business owner**, dépose tes documents, "
                    + "puis l'admin valide. Ensuite tu gères tables, occupation live et réservations.";
            case WORLD_CUP -> "FanConnect couvre la **CDM 2026** (USA/Canada/Mexique) et la **CDM 2030** "
                    + "(Maroc, Espagne, Portugal). Le Match Center montre scores, groupes et lieux de diffusion.";
            case CANCEL -> "Pour annuler : va dans **Mon dashboard**, ouvre la réservation, puis annule si elle n'est pas encore check-in. "
                    + "Les règles de remboursement suivent le statut du paiement.";
            default -> null;
        };
    }
}
