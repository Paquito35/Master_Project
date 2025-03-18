// il y a des petite incohérence dans le code si y a écrit pas supprimer tu supprimes pas !!
console.log("📂 script.js est bien chargé !");
var goingForward = false; // 🔹 Variable globale pour suivre le sens de navigation
console.log(`${goingForward}`);

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOMContentLoaded déclenché !");
    console.log("Chargement de la page...");

    console.log("Suppression des variables du localStorage au lancement de la page...");

    // On supprime les variable à chaque lancement de page pour pas que l'ordi se croit plus intelligent qu'il est sencé être
    // Liste des clés à supprimer (toutes les variables redevienne null au lancement du code)
    // Ca parait basique mais les machines sont d'une débilité sans nom
    const keysToRemove = ["selectedVoiceYourTts", "selectedVoiceXtts", "uploadChoice", "selectedModel"];

    // Supprimer chaque clé du localStorage
    keysToRemove.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            console.log(`Clé supprimée : ${key}`);
        } else {
            console.log(`Clé ${key} n'existe pas dans le localStorage.`);
        }
    });

    // Vérifier le contenu du localStorage après suppression
    printLocalStorage();
    
    // ON va print pour vérifier que tout fonctionne bien
    function printLocalStorage() {
        console.log("Contenu du localStorage après suppression :");
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`${key}: ${value}`);
        }
    }
    

    let flipbook = $(".flipbook");
    if (flipbook.data("turn")) {
        console.log("Réinitialisation du flipbook...");
        flipbook.turn("destroy");
        flipbook.html(""); // Efface le contenu pour éviter les conflits
        updatePageNumber(1); // Commencer sur la page 1
    }

    flipbook.turn({
        width: 800,
        height: 500,
        autoCenter: true,
        acceleration: true,
        gradients: true,
        elevation: 50,
        duration: 600,
        display: "double"
    });

    console.log("page charger avec succès ! (tu es un goat 🗿)");

    // Stockage de la voix sélectionnée pour le modèle "your_tts"
    function setupVoiceSelection() {
        console.log("entering setupVoiceSelection function");
        let voiceSelectYourTts = document.getElementById("speaker-your-tts");
        if (voiceSelectYourTts) {
            voiceSelectYourTts.addEventListener("change", function() {
                const selectedVoice = this.value;
                if (selectedVoice) {
                    localStorage.setItem("selectedVoiceYourTts", selectedVoice);
                    console.log("✅ Voix sélectionnée stockée pour 'your_tts' :", selectedVoice);
                    console.log("Valeur dans localStorage :", localStorage.getItem("selectedVoiceYourTts"));
                }
            });
        } else {
            console.error("❌ Élément #speaker-your-tts introuvable !");
        }

        let voiceSelectXtts = document.getElementById("speaker-xtts");
        if (voiceSelectXtts) {
            voiceSelectXtts.addEventListener("change", function() {
                const selectedVoice = this.value;
                if (selectedVoice) {
                    localStorage.setItem("selectedVoiceXtts", selectedVoice);
                    console.log("✅ Voix sélectionnée stockée pour 'xtts_v2' :", selectedVoice);
                    console.log("Valeur dans localStorage :", localStorage.getItem("selectedVoiceXtts"));
                }
            });
        } else {
            console.error("❌ Élément #speaker-xtts introuvable !");
        }
    }

    let modelSelect = document.getElementById("model");
    if (modelSelect) {
        modelSelect.addEventListener("change", function() {
            const selectedModel = this.value;
            if (selectedModel) {
                localStorage.setItem("selectedModel", selectedModel);
                console.log("✅ Modèle sélectionné stocké :", selectedModel);
                console.log("Valeur dans localStorage :", localStorage.getItem("selectedModel"));
            }
        });
    } else {
        console.error("❌ Élément #model introuvable !");
    }

    let uploadChoice = document.getElementById("voiceOption");
    if (uploadChoice) {
        uploadChoice.addEventListener("change", function() {
            const uploadChoice = this.value;
            if (uploadChoice) {
                localStorage.setItem("uploadChoice", uploadChoice);
                console.log("✅ Modèle sélectionné stocké :", uploadChoice);
                console.log("Valeur dans localStorage :", localStorage.getItem("uploadChoice"));
            }
        });
    } else {
        console.error("❌ Élément #model introuvable !");
    }

    function getNextValidPage(currentPage, goingForward = true) {
        let nextPage = goingForward ? currentPage + 2 : currentPage - 2;
        let model = localStorage.getItem("selectedModel");
        let voiceChoice = localStorage.getItem("selectedVoiceYourTts");
        let uploadChoice = localStorage.getItem("uploadChoice");

        while (true) {
            console.log(`currentPage: ${currentPage}`);
            // Si "xtts_v2" est sélectionné, skip 4-5, 6-7 et 8-9
            if (currentPage === 4 && goingForward && model === "xtts_v2") {
                console.log(`Skip pages ${nextPage}-${nextPage + 1} (xtts_v2)`);
                return 10; // Aller à 10-11 normalement
            }

            // Si on est en 4-5 et "Télécharger un fichier audio" est sélectionné, aller directement à 10-11
            if ((currentPage === 5 || currentPage === 6 || currentPage === 7) && goingForward && uploadChoice === "upload") {
                console.log(`vous etes entrer dans cette boucle (ligne 138) #je met les num de ligne psk ca me casse les 8`);
                console.log(`currentPage: ${voiceChoice}`);
                console.log(`going to page 8 (upload)`);
                return 9; // Aller à 10-11 normalement
            }

            if ((currentPage === 7 || currentPage === 8 || currentPage === 9 || currentPage === 10 || currentPage === 11) && goingForward) {
                setTimeout(() => {
                    console.log(`tu es rentrer dans la boucle ligne 146`);
                    console.log(`Skip pages ${nextPage}-${nextPage + 1} (8-9/10-11)`);
                    return 13; // Aller à 10-11 normalement
            }, 100); // Attendre 100ms avant de vérifier
            }
            console.log(`goingFoward ${goingForward} `);
            break; // Sortir de la boucle si la paire de pages est valide
        }

        return nextPage;
    }

    // **Gestion automatique des skips selon les choix**
    flipbook.bind("turning", function(event, page) {
        let nextValidPage = getNextValidPage(page, goingForward); // Pass `goingForward` to check the direction

        if (page < nextValidPage) {
            goingForward = true; // Moving forward (next page)
        } else if (page > nextValidPage) {
            goingForward = false; // Moving backward (previous page)
        }

        if (nextValidPage !== page + 2) {
            console.log(`Skipping pages ${page + 2}-${page + 3} -> Going to pages ${nextValidPage}-${nextValidPage + 1}`);
            event.preventDefault(); // Empêche le changement de page immédiat
            flipbook.turn("page", nextValidPage); // Applique la nouvelle page à afficher
        }

        // Si la page est la page 4, effectuer les actions spécifiques
        if (page === 4){ // me demande pas pourquoi c'est 4 alors que s'est sencé etre a la page 2/3
            setTimeout(() => {
                // Attendre que la page soit entièrement rendue avant de vérifier les éléments
                const selectedModel = localStorage.getItem("selectedModel");
                if (selectedModel) {
                    console.log("Le modèle sélectionné est :", selectedModel);
                    document.getElementById("model").value = selectedModel;  // Met à jour le champ avec la valeur stockée
                } else {
                    console.log("❌ Aucun modèle sélectionné.");
                    alert("❌ Aucun modèle sélectionné.");
                    event.preventDefault();
                    flipbook.turn("page", 2); // Retour à la page 2 en cas d'erreur
                }
                console.log("📝 Valeur de selectedModel récupérée depuis localStorage :", selectedModel);
            }, 100); // Attendre 100ms avant de vérifier
        }

        if (page === 6) {
            setTimeout(() => {
                console.log("vous etes page 4 ligne 191"); // pose pas de question et NE PAS SUPPRIMER cette ligne
                // Ajoutez un écouteur pour le choix de l'option de voix
                const voiceOption = localStorage.getItem("uploadChoice");
                if (voiceOption) {
                    console.log("✅ Option sélectionnée stockée :", voiceOption);
                    document.getElementById("voiceOption").value = voiceOption;
                    console.log("Valeur dans localStorage :", localStorage.getItem("uploadChoice"));
                } else {
                    console.log("❌ Aucune voix sélectionné.");
                    alert("❌ Aucune voix sélectionné.");
                    event.preventDefault();
                    flipbook.turn("page", 4); // Retour à la page 2 en cas d'erreur
                }
                console.log("📝 Valeur de uploadChoice récupérée depuis localStorage :", voiceOption);
            }, 100); // Attendre 100ms avant de vérifier
        }

        // Si la page est la page 9, effectuer les actions spécifiques
        if (page === 6 || page === 7) {
            // Attendre que la page soit entièrement rendue avant de vérifier les éléments
            setTimeout(() => {
                const recordingPage2 = document.getElementById("recordingPage2");
                if (recordingPage2) {
                    console.log("✅ La page d'enregistrement existe !");
                } else {
                    console.error("❌ La page d'enregistrement n'existe pas !");
                }
        
                const startButton = document.getElementById("startRecording");
                const stopButton = document.getElementById("stopRecording");
        
                let mediaRecorder = null;
                let audioChunks = [];
                let stream = null; // ✅ Stockage du flux audio pour pouvoir le stopper correctement
        
                async function startRecording() {
                    try {
                        console.log("🎙️ Demande d'accès au microphone...");
                        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
                        mediaRecorder = new MediaRecorder(stream);
                        audioChunks = [];
        
                        mediaRecorder.ondataavailable = event => {
                            audioChunks.push(event.data);
                        };
        
                        mediaRecorder.onstop = async () => {
                            console.log("📁 Enregistrement terminé - Sauvegarde...");
        
                            if (audioChunks.length === 0) {
                                console.error("❌ Aucun audio capturé !");
                                alert("❌ L'enregistrement a échoué, aucun son capturé.");
                                return;
                            }
        
                            let textBoxValue = document.getElementById("recordingName")?.value.trim();
                            let fileName = textBoxValue ? `recording_${textBoxValue}.wav` : "recording_default.wav";
        
                            // Nettoyer le nom du fichier
                            fileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
        
                            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                            console.log("📂 Blob audio créé, taille :", audioBlob.size + " bytes");
        
                            const formData = new FormData();
                            formData.append("audio", audioBlob, fileName);
        
                            try {
                                const response = await fetch("/save_recording", {
                                    method: "POST",
                                    body: formData
                                });
        
                                if (!response.ok) throw new Error("Erreur lors de l'enregistrement.");
                                console.log("✅ Enregistrement sauvegardé !");
                                flipbook.turn("page", 8);
                            } catch (error) {
                                console.error("❌ Erreur :", error);
                                alert("Une erreur est survenue.");
                            }
                        };
        
                        mediaRecorder.start();
                        console.log("🔴 Enregistrement en cours...");
        
                        startButton.disabled = true;
                        stopButton.disabled = false;
        
                    } catch (error) {
                        console.error("❌ Erreur microphone :", error);
                        alert("Impossible d'accéder au microphone.");
                    }
                }
        
                function stopRecording() {
                    if (mediaRecorder && mediaRecorder.state !== "inactive") {
                        mediaRecorder.stop();
                        console.log("🛑 Enregistrement arrêté.");
        
                        // ✅ Arrêter complètement le microphone
                        if (stream) {
                            stream.getTracks().forEach(track => track.stop());
                            console.log("🎤 Micro arrêté.");
                        }
        
                        startButton.disabled = false;
                        stopButton.disabled = true;
                    } else {
                        console.error("❌ Impossible d'arrêter l'enregistrement (mediaRecorder non actif)");
                    }
                }
        
                // ✅ Suppression des anciens écouteurs pour éviter les doublons
                startButton.removeEventListener("click", startRecording);
                startButton.addEventListener("click", () => {
                    console.log("🎙️ Bouton 'Démarrer' cliqué !");
                    startRecording();
                });
        
                stopButton.removeEventListener("click", stopRecording);
                stopButton.addEventListener("click", () => {
                    console.log("🛑 Bouton 'Arrêter' cliqué !");
                    stopRecording();
                });
        
            }, 100);
        }

        if (page === 8 || page === 9) { // j'en ai mis 2 psk une ca marche pas me pose pas la question je suis aussi intelligent qu'un ver de terre 
            // Ajoutez cet écouteur sur la page 4/5 pour stocker le choix de la voix
            setTimeout(() => {
                setupVoiceSelection();
            }, 100); // Attendre 100ms avant de vérifier
        }

        if (page === 10) {
            setTimeout(() => {
                setupVoiceSelection();
            }, 100); // Attendre 100ms avant de vérifier
        }

        if (page === 12 && goingForward) {
            const selectedModel = localStorage.getItem("selectedModel");
            if (selectedModel === "your_tts") {
                console.log("selected Model (ligne217/output[your_tts]):", selectedModel);
                const selectedVoice = localStorage.getItem("selectedVoiceYourTts");
                console.log("selected voice (ligne219/output[unknown]):", selectedVoice);
                if (selectedVoice) {
                    console.log("La voix sélectionnée pour 'your_tts' est :", selectedVoice);
                    document.getElementById("speaker-your-tts").value = selectedVoice;  // Met à jour le champ avec la valeur stockée
                } else {
                    console.log("❌ Aucune voix sélectionnée pour 'your_tts'.");
                    alert("❌ Aucune voix sélectionnée pour 'your_tts'.");
                    flipbook.turn("page", 4); // Retour à la page 4 en cas d'erreur
                }
                console.log("📝 Valeur de selectedVoiceYourTts récupérée depuis localStorage :", selectedVoice);
            } else if (selectedModel === "xtts_v2") {
                const selectedVoice = localStorage.getItem("selectedVoiceXtts");
                if (selectedVoice) {
                    console.log("La voix sélectionnée pour 'xtts_v2' est :", selectedVoice);
                    document.getElementById("speaker-xtts").value = selectedVoice;  // Met à jour le champ avec la valeur stockée
                } else {
                    console.log("❌ Aucune voix sélectionnée pour 'xtts_v2'.");
                    alert("❌ Aucune voix sélectionnée pour 'xtts_v2'.");
                    flipbook.turn("page", 10); // Retour à la page 10 en cas d'erreur
                }
                console.log("📝 Valeur de selectedVoiceXtts récupérée depuis localStorage :", selectedVoice);
            }
        }

        // ✅ **Récupérer le texte de la page 13 avant d'aller à la page 14**
        if (page === 14 && goingForward) {
            setTimeout(() => {
                const fileInput = document.getElementById("storyFile");
                if (!fileInput) {
                    console.error("❌ L'élément #storyFile est introuvable !");
                    return;
                }
        
                console.log("📂 Élément fileInput détecté :", fileInput);
                console.log("📂 Nombre de fichiers sélectionnés :", fileInput.files.length);
        
                if (!fileInput.files.length) {
                    alert("❌ Veuillez sélectionner un fichier PDF ou DOCX avant de continuer !");
                    flipbook.turn("page", 13);
                    return;
                }
        
                const file = fileInput.files[0];
                console.log("📤 Envoi du fichier :", file.name);
        
                const formData = new FormData();
                formData.append("file", file);
        
                const selectedModel = localStorage.getItem("selectedModel");
                const selectedVoice = localStorage.getItem(selectedModel === "your_tts" ? "selectedVoiceYourTts" : "selectedVoiceXtts");
                console.log("📝 Modèle sélectionné :", selectedModel);
                console.log("📝 Voix sélectionnée :", selectedVoice);
        
                if (selectedModel && selectedVoice) {
                    formData.append("model", selectedModel);
                    formData.append("speaker", selectedVoice);
        
                    if (selectedModel === "your_tts") {
                        const voiceFileInput = document.getElementById("voiceFileInput");
                        if (voiceFileInput && voiceFileInput.files.length > 0) {
                            formData.append("speaker_wav", voiceFileInput.files[0]);
                        }
                    }
                } else {
                    if (!selectedModel) {
                        console.log("❌ Modèle non sélectionné.");
                        alert("❌ Modèle non sélectionné.");
                        flipbook.turn("page", 2);
                        return;
                    }
                    if (!selectedVoice) {
                        console.log("❌ Voix non sélectionnée.");
                        alert("❌ Voix non sélectionnée.");
                        flipbook.turn("page", selectedModel === "your_tts" ? 4 : 10);
                        return;
                    }
                }
        
                // Afficher le spinner de chargement
                const loadingCircle = document.getElementById("loadingCircle");
                loadingCircle.classList.remove("hidden");
        
                fetch("/upload", {
                    method: "POST",
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur HTTP : ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    console.log("✅ Réponse du serveur :", result);
                    //alert(result.text);
        
                    // Masquer le spinner de chargement
                    loadingCircle.classList.add("hidden");
        
                    // Afficher le lecteur audio
                    const audioPlayer = document.getElementById("audioPlayer");
                    const audioSource = document.getElementById("audioSource");
                    audioSource.src = result.audio;
                    audioPlayer.load();
                    audioPlayer.classList.remove("hidden");
                    audioPlayer.play();
                })
                .catch(error => {
                    console.error("❌ Erreur d'envoi du fichier :", error);
                    alert("❌ Une erreur s'est produite.");
                    flipbook.turn("page", 13);
        
                    // Masquer le spinner de chargement en cas d'erreur
                    loadingCircle.classList.add("hidden");
                });
            }, 300);
        }
        
        
        
        
        var goingForward = false
        console.log(`goingFoward ${goingForward} `);
    });

    function updatePageNumber(page) {
        let totalPages = $(".flipbook").turn("pages");
        document.getElementById("page-number").textContent = `Page ${page} / ${totalPages}`;
    }

    // Mise à jour du numéro de page à chaque changement
    $(".flipbook").bind("turned", function(event, page) {
        updatePageNumber(page);
    });
});