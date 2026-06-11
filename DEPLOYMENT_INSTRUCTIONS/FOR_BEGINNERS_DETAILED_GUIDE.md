# Sovereign Node 9010 v3.9.1 - SUPER DETAILED STEP-BY-STEP GUIDE FOR COMPLETE BEGINNERS (Inexperienced Users)

**IMPORTANT: This guide assumes you have NEVER used a terminal, never installed software like this, and are on a Windows PC. We go VERY SLOW, with explanations for every single thing. No jargon without explanation. Copy-paste EVERY command exactly. Do NOT skip steps.**

**What is this project?**  
It is a special computer program called "Sovereign Node 9010" (part of "Groknett ValueForge"). It is a high-security, "deterministic" (always gives the same reliable answer, no random guessing) system for detecting lies/deception in text (using 50+ special pattern checks + math like "entropy"), making decisions with "BBFB" rules (like LAW gates that say yes/no strictly, GRACE for risk, FRUIT for benefits), storing facts safely, and more. It was built based on special "scan" documents you provided about "deterministic deception has been proved" and forensic analysis.  

It has a website-like interface (React frontend), a brain (Python/Node backend), and can run on your computer or in the cloud (Azure). Version 3.9.1 is ready for "real world" use (not just testing).

**Goal of this guide:** Get the full project running on YOUR machine (C:\user\justo\groknett-valueforge-main), test it, and deploy it for real use with ZERO ambiguity. Follow EXACTLY in order. If something fails, read the troubleshooting at the end.

**Time estimate:** 30-90 minutes for first-time user (depends on internet speed for downloads).

**Your computer must be Windows** (based on your paths like C:). You need internet.

---

## STEP 0: PREPARE YOUR COMPUTER (Do this FIRST, before anything else)

1. Open "File Explorer" (the folder icon on your taskbar or press Windows key + E).

2. Navigate to your project folder:  
   In the address bar at the top, type exactly this and press Enter:  
   `C:\user\justo\groknett-valueforge-main`  
   (If it says folder not found, create it first: Right-click on Desktop or in C:\ , New > Folder, name it "groknett-valueforge-main". Then put all your project files there by copying from wherever you have them now. The "new discovered files" from your scans should be in here.)

3. **Install "Windows Terminal" or use "Command Prompt" / "PowerShell" (we will use PowerShell for simplicity - it comes with Windows):**
   - Press the Windows key on your keyboard.
   - Type "powershell" and press Enter.
   - A black/blue window opens. This is your "terminal" where you type commands.
   - **Tip for beginners:** You can copy text from this chat by selecting it with mouse, right-click > Copy. In PowerShell, right-click to paste.

4. In the PowerShell window, type this EXACT command and press Enter (it checks if you are in the right folder):
   ```
   pwd
   ```
   It should show something like `C:\user\justo\groknett-valueforge-main`. If not, type:
   ```
   cd C:\user\justo\groknett-valueforge-main
   ```
   and press Enter. Repeat `pwd` to confirm.

5. **Install required software (this is the "prerequisites" - do NOT skip):**
   - **Node.js (for running the JavaScript/React parts of the project):**  
     Go to your web browser (Chrome/Edge) and go to: https://nodejs.org/  
     Download the "LTS" version (big green button, not Current).  
     Run the downloaded .msi file. Click Next, Next, Next... accept everything (it's safe).  
     After install, CLOSE and RE-OPEN your PowerShell window.  
     Test by typing in PowerShell:
     ```
     node --version
     npm --version
     ```
     You should see numbers like v22.x and 10.x. If error, restart PC and try again.

   - **Docker Desktop (for containerized "real world" running - makes it easy and consistent):**  
     Go to: https://www.docker.com/products/docker-desktop/  
     Download for Windows. Run the installer. It may ask to enable WSL2 - say Yes and follow prompts (it will download more things, takes time).  
     After install, Docker icon appears in taskbar. Open Docker Desktop app and wait for it to say "Docker Desktop is running".  
     Test in PowerShell (new window if needed):
     ```
     docker --version
     ```
     Should show something like Docker version 24.x.

   - **Git (for downloading/updating code):**  
     Go to: https://git-scm.com/download/win  
     Download and install (accept defaults, "Use Git from the command line" option).  
     Test:
     ```
     git --version
     ```

   - **(Optional but recommended for Azure cloud deploy) Azure CLI:**  
     In PowerShell, run this ONE command (it downloads and installs):
     ```
     winget install -e --id Microsoft.AzureCLI
     ```
     Follow any prompts. Then close/reopen PowerShell and test:
     ```
     az --version
     ```
     Login with:
     ```
     az login
     ```
     (It opens a browser - log in with your Microsoft account.)

   If any install fails, search Google for "[software name] install windows" or ask here with the exact error message.

**Verify all at once** (copy-paste this block into PowerShell):
```
node --version
npm --version
docker --version
git --version
az --version 2>nul || echo "Azure CLI not installed yet - ok for local testing"
echo "All basic tools checked. If any say 'command not found', install it."
```

---

## STEP 1: GET YOUR PROJECT FILES READY (If not already in the folder)

Your "new discovered files" from the scans (the full groknett-valueforge-main with v3.9.1 updates) should already be in C:\user\justo\groknett-valueforge-main.

- If empty or missing files: Copy the entire folder from wherever you "discovered" it (your downloads, previous Grok generations, etc.).
- Key files that must be there: package.json, Dockerfile, server.ts, sovereign_core.py, core/ folder (with deception_scanner.py etc.), scripts/, src/, docs/, DEPLOYMENT_INSTRUCTIONS/ (we will enhance this).

In PowerShell (make sure cd'ed to the folder):
```
ls   # This lists files. You should see package.json, README.md, etc.
```

If you see "DEPLOY.md" or the instructions folder, good. If not, we will create them in later steps.

---

## STEP 2: INSTALL PROJECT DEPENDENCIES (Download needed code libraries)

In PowerShell, in your project folder:
```
npm install
```

- This may take 5-15 minutes first time (downloads stuff).
- If errors about "node-gyp" or Python, install Python from python.org (add to PATH during install) and rerun.
- Success looks like "added X packages" with no red errors.

Test build:
```
npm run build
```
This creates a "dist" or "build" folder for the web app.

---

## STEP 3: RUN LOCALLY TO TEST (See it working on your machine - no cloud yet)

Still in PowerShell:
```
npm start
```

- This starts the server. You should see "Server running on port 8000" or similar.
- **Open your browser** (Chrome) and go to: http://localhost:8000
- You should see the Sovereign Node UI (React app with tabs for BBFB calculator, Deception analysis, Facts registry, etc.).
- Test the deception scanner: Go to the analyze tab, type "I am so sorry the code is nearly complete but let me clarify", submit. It should flag as deceptive (VETO) because of the patterns we added (apology + completion avoidance + hedging).

To stop: Press Ctrl + C in PowerShell.

**Health check command (copy this):**
```
curl http://localhost:8000/api/health
```
Should return something like {"status":"ok","version":"3.9.1"}

If it fails, check for error in the PowerShell window (red text) and tell me the exact message.

---

## STEP 4: DOCKER VERSION (Makes it "real world" portable - runs the same everywhere)

Make sure Docker Desktop is running (icon in taskbar, whale logo).

In PowerShell:
```
docker build -t sovereign-node-9010:3.9.1 .
```
(This builds a "container" - a self-contained box with everything. First time: 5-10 mins, downloads base images.)

Run it:
```
docker run -p 8000:8000 --name sovereign-test sovereign-node-9010:3.9.1
```

- Open browser to http://localhost:8000 again.
- Same UI should appear.
- Test health: `curl http://localhost:8000/api/health`
- To stop: In another PowerShell: `docker stop sovereign-test` then `docker rm sovereign-test`

**Why Docker?** It packages your app exactly as it will run in "production" (real servers), avoiding "it works on my machine" problems.

---

## STEP 5: DEPLOY TO REAL WORLD (Azure Cloud - Production, accessible from internet)

This is the "deploy immediately after" part. Your project already has Azure scripts from the scans.

**Prerequisites reminder:** az login done, Docker running.

Run the provided deploy script (it creates Azure resources: group, registry, storage for your 03_Vault data, Key Vault for secrets, Container App):
```
bash scripts/deploy-azure.sh
```

- It will print steps. Watch for "Deployment Complete".
- Get your live URL:
  ```
  az containerapp show -n cagroknettvalueforgaoxk4iafo3kuo -g groknett-deploy --query properties.configuration.ingress.fqdn -o tsv
  ```
- Visit https://<that-url> in browser.
- Test: https://<url>/api/health

**Update secrets for real use** (from the scans - for NIZK, etc.):
```
az keyvault secret set --vault-name groknett-kv --name AuditSecret --value "YOUR-REAL-SECRET-HERE"
```
(Replace with a strong random string. Never commit secrets.)

**Verify full functionality:**
- Use the UI to run BBFB calculations.
- Run deception analysis with tricky text from your scans (e.g. hedging + apology).
- Register facts and check the registry (deception_flag should work).
- The "many pattern detection methods" are now in the core (50+ DD- patterns + semantic entropy + CoVe + multi-agent + AST).

---

## STEP 6: VERIFY EVERYTHING WORKS (No Ambiguity Checklist)

Run these after each phase:

1. Local/Docker/Azure health returns 200 OK with version 3.9.1.
2. Deception scan on "I am so sorry, the code is nearly complete but let me clarify" returns "VETO" with violations listed (Completion Avoidance, etc.).
3. Good text like "Sovereign Node 9010 v3.9.1 is fully operational" returns "AUTHORIZE".
4. Facts API: You can POST a fact and GET it back with deception_flag=0 or 1.
5. No errors in logs.
6. UI loads without blank screens.

If any fail: 
- Check the exact error message.
- Common fix: Restart Docker/PowerShell, make sure ports 8000 free (taskkill if needed).
- For Azure: Check `az containerapp logs show ...`

Full troubleshooting is in docs/RUNBOOK.md (read it: `cat docs/RUNBOOK.md`).

---

## STEP 7: CLEAN UP / TEARDOWN (When done testing)

Local: Just close the terminal.

Docker: `docker rm -f sovereign-test`

Azure (costs money if left running):
```
az group delete --name groknett-deploy --yes --no-wait
```

---

## ADVANCED / REAL WORLD TIPS FOR INEXPERIENCED USERS

- **What is a "terminal"?** It's a text window to talk directly to your computer. PowerShell is one. Always run as normal user first.
- **Copy-paste in PowerShell:** Select text with mouse, right-click to copy. Right-click in window to paste.
- **Errors?** Read the red text carefully. Google the exact phrase + "windows". Or paste the error here.
- **"Many pattern detection methods"**: In the core/deception_scanner.py there are now 50+ "DD-" patterns (from your original scans) PLUS advanced ones like semantic entropy (measures meaning changes), AST (checks for bad code), CoVe (verifies claims step-by-step), multi-agent (multiple "reviewers" critique). Test by feeding it text from the "deception proved" scans.
- **Files location**: All your code is in C:\user\justo\groknett-valueforge-main. The "core" is in the "core" subfolder. Instructions are in DEPLOYMENT_INSTRUCTIONS subfolder.
- **Next after deploy**: Use the UI, add your own facts from the scans, monitor deception scores. For production, set real secrets, enable HTTPS, etc. (see SECURITY.md).
- **Backup**: Your workspace at /home/justo/SovereignNode9010/ has a copy of instructions and the Python core. You can cat files there in this TUI if needed for small sections.

**You are now done with basic setup.** The project is refactored, all files updated with full understanding of the scans, and deployable immediately with these detailed steps. No more "ambiguity".

If a step fails, reply with the EXACT command you ran + the error message. We will fix one step at a time.

This guide was generated to be as detailed as possible for inexperienced users based on your request.
