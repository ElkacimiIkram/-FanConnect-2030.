package com.fanconnect.service.impl;

import java.util.List;

/**
 * Annotated question bank used to train FanBot intent classification.
 * Includes frequent questions, typos, French and Darija-latin.
 */
final class FanAssistantTrainingSet {

    record Example(FanAssistantIntent intent, String question) {
    }

    static final List<String> FREQUENT_QUESTIONS = List.of(
            "Café le plus proche",
            "Où regarder le match du Maroc ?",
            "Quels matchs sont en direct ?",
            "Comment réserver une table ?",
            "Cafés calmes à Casablanca",
            "C'est quoi FanConnect ?",
            "Comment payer ?",
            "Où est mon ticket QR ?"
    );

    static List<Example> examples() {
        return List.of(
                // GREETING
                ex(FanAssistantIntent.GREETING, "salut"),
                ex(FanAssistantIntent.GREETING, "bonjour"),
                ex(FanAssistantIntent.GREETING, "bonsoir"),
                ex(FanAssistantIntent.GREETING, "hello"),
                ex(FanAssistantIntent.GREETING, "salam"),
                ex(FanAssistantIntent.GREETING, "cv"),
                ex(FanAssistantIntent.GREETING, "ça va"),
                ex(FanAssistantIntent.GREETING, "hey fanbot"),
                ex(FanAssistantIntent.GREETING, "merci"),
                ex(FanAssistantIntent.GREETING, "thanks"),
                ex(FanAssistantIntent.GREETING, "ok merci beaucoup"),

                // HELP
                ex(FanAssistantIntent.HELP, "aide"),
                ex(FanAssistantIntent.HELP, "help"),
                ex(FanAssistantIntent.HELP, "tu peux faire quoi"),
                ex(FanAssistantIntent.HELP, "comment ça marche"),
                ex(FanAssistantIntent.HELP, "questions fréquentes"),
                ex(FanAssistantIntent.HELP, "faq"),
                ex(FanAssistantIntent.HELP, "que peux tu faire"),
                ex(FanAssistantIntent.HELP, "besoin d'aide"),
                ex(FanAssistantIntent.HELP, "menu"),

                // ABOUT
                ex(FanAssistantIntent.ABOUT, "c'est quoi fanconnect"),
                ex(FanAssistantIntent.ABOUT, "cest quoi fanconnect"),
                ex(FanAssistantIntent.ABOUT, "qu'est ce que fanconnect 2030"),
                ex(FanAssistantIntent.ABOUT, "a quoi sert cette application"),
                ex(FanAssistantIntent.ABOUT, "presenter le projet"),
                ex(FanAssistantIntent.ABOUT, "c koi fanconnect"),
                ex(FanAssistantIntent.ABOUT, "plateforme reservation cafe match"),

                // NEAREST
                ex(FanAssistantIntent.NEAREST_CAFE, "café le plus proche"),
                ex(FanAssistantIntent.NEAREST_CAFE, "cafe plus proche"),
                ex(FanAssistantIntent.NEAREST_CAFE, "quelle est cafe plus proche pour mois"),
                ex(FanAssistantIntent.NEAREST_CAFE, "quel est le cafe le plus proche pour moi"),
                ex(FanAssistantIntent.NEAREST_CAFE, "le cafe le plus pres"),
                ex(FanAssistantIntent.NEAREST_CAFE, "café près de moi"),
                ex(FanAssistantIntent.NEAREST_CAFE, "cafe pres de moi"),
                ex(FanAssistantIntent.NEAREST_CAFE, "où est le café le plus proche"),
                ex(FanAssistantIntent.NEAREST_CAFE, "nearest cafe"),
                ex(FanAssistantIntent.NEAREST_CAFE, "café à côté"),
                ex(FanAssistantIntent.NEAREST_CAFE, "cafe a cote de moi"),
                ex(FanAssistantIntent.NEAREST_CAFE, "je suis a oualidia cafe proche"),
                ex(FanAssistantIntent.NEAREST_CAFE, "cafe proche oualidia"),
                ex(FanAssistantIntent.NEAREST_CAFE, "fin cafe 9rib"),
                ex(FanAssistantIntent.NEAREST_CAFE, "ou se trouve le cafe le plus proche"),
                ex(FanAssistantIntent.NEAREST_CAFE, "restaurant le plus proche pour le match"),

                // QUIET
                ex(FanAssistantIntent.QUIET_CAFE, "cafés calmes à casablanca"),
                ex(FanAssistantIntent.QUIET_CAFE, "cafe pas trop plein"),
                ex(FanAssistantIntent.QUIET_CAFE, "un cafe pas trop de monde"),
                ex(FanAssistantIntent.QUIET_CAFE, "endroit calme pour regarder le match"),
                ex(FanAssistantIntent.QUIET_CAFE, "places disponibles"),
                ex(FanAssistantIntent.QUIET_CAFE, "cafe avec de la place"),
                ex(FanAssistantIntent.QUIET_CAFE, "pas complet"),
                ex(FanAssistantIntent.QUIET_CAFE, "affluence faible"),
                ex(FanAssistantIntent.QUIET_CAFE, "cafe tranquille rabat"),
                ex(FanAssistantIntent.QUIET_CAFE, "où il y a encore de la place"),

                // LIVE
                ex(FanAssistantIntent.LIVE_MATCHES, "quels matchs sont en direct"),
                ex(FanAssistantIntent.LIVE_MATCHES, "matchs en direct"),
                ex(FanAssistantIntent.LIVE_MATCHES, "match live"),
                ex(FanAssistantIntent.LIVE_MATCHES, "y a t il un match maintenant"),
                ex(FanAssistantIntent.LIVE_MATCHES, "score en live"),
                ex(FanAssistantIntent.LIVE_MATCHES, "match en cours"),
                ex(FanAssistantIntent.LIVE_MATCHES, "c koi le score"),
                ex(FanAssistantIntent.LIVE_MATCHES, "qui joue maintenant"),
                ex(FanAssistantIntent.LIVE_MATCHES, "direct coupe du monde"),

                // TEAM
                ex(FanAssistantIntent.TEAM_MATCH, "où regarder le match du maroc"),
                ex(FanAssistantIntent.TEAM_MATCH, "ou regarder le maroc"),
                ex(FanAssistantIntent.TEAM_MATCH, "match du maroc"),
                ex(FanAssistantIntent.TEAM_MATCH, "maroc vs espagne"),
                ex(FanAssistantIntent.TEAM_MATCH, "quand joue le maroc"),
                ex(FanAssistantIntent.TEAM_MATCH, "prochain match des atlas"),
                ex(FanAssistantIntent.TEAM_MATCH, "match portugal"),
                ex(FanAssistantIntent.TEAM_MATCH, "match de la france"),
                ex(FanAssistantIntent.TEAM_MATCH, "bresil aujourd hui"),
                ex(FanAssistantIntent.TEAM_MATCH, "argentine ce soir"),

                // TONIGHT
                ex(FanAssistantIntent.TONIGHT, "où réserver pour ce soir"),
                ex(FanAssistantIntent.TONIGHT, "matchs ce soir"),
                ex(FanAssistantIntent.TONIGHT, "quoi regarder ce soir"),
                ex(FanAssistantIntent.TONIGHT, "prochains matchs"),
                ex(FanAssistantIntent.TONIGHT, "programme aujourd hui"),
                ex(FanAssistantIntent.TONIGHT, "matchs de demain"),
                ex(FanAssistantIntent.TONIGHT, "calendrier des matchs"),

                // BOOKING
                ex(FanAssistantIntent.BOOKING, "comment réserver une table"),
                ex(FanAssistantIntent.BOOKING, "comment reserver"),
                ex(FanAssistantIntent.BOOKING, "je veux reserver"),
                ex(FanAssistantIntent.BOOKING, "comment booker un cafe"),
                ex(FanAssistantIntent.BOOKING, "étapes reservation"),
                ex(FanAssistantIntent.BOOKING, "comment faire une reservation"),
                ex(FanAssistantIntent.BOOKING, "reserver une table pour le match"),
                ex(FanAssistantIntent.BOOKING, "bghit nreservi"),
                ex(FanAssistantIntent.BOOKING, "je peux reserver sans compte"),

                // PAYMENT
                ex(FanAssistantIntent.PAYMENT, "comment payer"),
                ex(FanAssistantIntent.PAYMENT, "vous acceptez stripe"),
                ex(FanAssistantIntent.PAYMENT, "paiement par carte"),
                ex(FanAssistantIntent.PAYMENT, "c'est payant"),
                ex(FanAssistantIntent.PAYMENT, "prix de la table"),
                ex(FanAssistantIntent.PAYMENT, "combien ca coute"),
                ex(FanAssistantIntent.PAYMENT, "tarif match day"),
                ex(FanAssistantIntent.PAYMENT, "mode de paiement"),

                // TICKET
                ex(FanAssistantIntent.TICKET, "où est mon ticket qr"),
                ex(FanAssistantIntent.TICKET, "ticket qr"),
                ex(FanAssistantIntent.TICKET, "comment recuperer mon ticket"),
                ex(FanAssistantIntent.TICKET, "check in cafe"),
                ex(FanAssistantIntent.TICKET, "code qr reservation"),
                ex(FanAssistantIntent.TICKET, "mon billet"),

                // OCCUPANCY
                ex(FanAssistantIntent.OCCUPANCY, "c'est quoi le vert orange rouge"),
                ex(FanAssistantIntent.OCCUPANCY, "occupation du cafe"),
                ex(FanAssistantIntent.OCCUPANCY, "affluence predite"),
                ex(FanAssistantIntent.OCCUPANCY, "comment marche l occupation"),
                ex(FanAssistantIntent.OCCUPANCY, "risque que ce soit plein"),
                ex(FanAssistantIntent.OCCUPANCY, "prediction ia occupation"),

                // ACCOUNT
                ex(FanAssistantIntent.ACCOUNT, "comment creer un compte"),
                ex(FanAssistantIntent.ACCOUNT, "login"),
                ex(FanAssistantIntent.ACCOUNT, "connexion"),
                ex(FanAssistantIntent.ACCOUNT, "mot de passe oublie"),
                ex(FanAssistantIntent.ACCOUNT, "compte fan ou owner"),
                ex(FanAssistantIntent.ACCOUNT, "s'inscrire"),

                // OWNER
                ex(FanAssistantIntent.OWNER, "comment ajouter mon cafe"),
                ex(FanAssistantIntent.OWNER, "je suis proprietaire"),
                ex(FanAssistantIntent.OWNER, "inscrire un restaurant"),
                ex(FanAssistantIntent.OWNER, "devenir partenaire"),
                ex(FanAssistantIntent.OWNER, "espace owner"),
                ex(FanAssistantIntent.OWNER, "verification documents"),

                // WORLD CUP
                ex(FanAssistantIntent.WORLD_CUP, "coupe du monde 2030"),
                ex(FanAssistantIntent.WORLD_CUP, "c'est ou la cd m 2030"),
                ex(FanAssistantIntent.WORLD_CUP, "maroc espagne portugal 2030"),
                ex(FanAssistantIntent.WORLD_CUP, "world cup 2026"),
                ex(FanAssistantIntent.WORLD_CUP, "villes hotes 2030"),
                ex(FanAssistantIntent.WORLD_CUP, "quand commence la coupe du monde 2030"),

                // CANCEL
                ex(FanAssistantIntent.CANCEL, "annuler ma reservation"),
                ex(FanAssistantIntent.CANCEL, "comment annuler"),
                ex(FanAssistantIntent.CANCEL, "remboursement"),
                ex(FanAssistantIntent.CANCEL, "je veux cancel")
        );
    }

    static int size() {
        return examples().size();
    }

    private static Example ex(FanAssistantIntent intent, String question) {
        return new Example(intent, question);
    }

    private FanAssistantTrainingSet() {
    }
}
