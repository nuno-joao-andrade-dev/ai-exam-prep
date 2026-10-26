# Offline `gemma4:e2b` Ollama Model Installation Guide (USB Drive: `OLLAMAMODEL`)

The USB drive **`OLLAMAMODEL`** contains a ready-to-copy `models/` folder (`blobs/`, `manifests/`, `manifests-v2/`, `metadata/`) for **`gemma4:e2b`** (~4.6 GB).

Students can copy the `models/` folder from the USB drive directly into their local Ollama directory on **Windows**, **macOS**, or **Linux** without downloading anything from the internet.

```text
OLLAMAMODEL/ (USB Drive)
├── README.md
└── models/
    ├── blobs/
    ├── manifests/
    ├── manifests-v2/
    └── metadata/
```

---

## 1. Windows Instructions

On Windows, Ollama stores models in:
`C:\Users\<YourUsername>\.ollama\models` (or `%USERPROFILE%\.ollama\models`)

### Option A: PowerShell (Recommended)
Open **PowerShell** and run (replace `D:` if your `OLLAMAMODEL` USB drive has a different drive letter):

```powershell
# Automatically find the OLLAMAMODEL USB drive (or set $usb = "D:")
$usb = (Get-Volume -FileSystemLabel "OLLAMAMODEL").DriveLetter + ":"

# Create the local Ollama models directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ollama\models"

# Copy blobs, manifests, manifests-v2, and metadata from the USB drive
Copy-Item -Path "$usb\models\*" -Destination "$env:USERPROFILE\.ollama\models\" -Recurse -Force

# Verify the model is installed
ollama list
ollama run gemma4:e2b "Say hello in one sentence."
```

### Option B: File Explorer (Drag & Drop)
1. Open the **`OLLAMAMODEL`** USB drive and copy the **`models`** folder.
2. Press **`Win + R`**, type **`%USERPROFILE%\.ollama`**, and press **Enter**.
3. Paste the **`models`** folder inside `.ollama` (choose **Replace / Merge files** if prompted).
4. Open a terminal and run `ollama list` to confirm `gemma4:e2b` appears.

---

## 2. macOS Instructions

On macOS, Ollama stores models in:
`~/.ollama/models` (`/Users/<YourUsername>/.ollama/models`)

### Option A: Terminal (Recommended)
Plug in the **`OLLAMAMODEL`** USB drive, open **Terminal**, and run:

```bash
# Create the local Ollama models directory if it doesn't exist
mkdir -p ~/.ollama/models

# Copy the model files from the OLLAMAMODEL USB volume
cp -rv /Volumes/OLLAMAMODEL/models/* ~/.ollama/models/

# Verify the model is installed
ollama list
ollama run gemma4:e2b "Say hello in one sentence."
```

### Option B: Finder (Drag & Drop)
1. Open **Finder**, press **`Cmd + Shift + G`**, type **`~/.ollama`**, and press **Enter**.
2. Drag the contents of **`OLLAMAMODEL/models/`** (`blobs`, `manifests`, `manifests-v2`, `metadata`) into **`~/.ollama/models/`**.
3. Run `ollama list` in Terminal to confirm `gemma4:e2b` appears.

---

## 3. Linux Instructions

On Linux, Ollama uses one of two model directories depending on how Ollama was installed:
- **Systemd Service Install** (`curl -fsSL https://ollama.com/install.sh | sh`): `/usr/share/ollama/.ollama/models`
- **User / Manual Install** (`ollama serve` run as your user): `~/.ollama/models`

### Option A: Linux with Systemd Service (`/usr/share/ollama/.ollama/models`)
```bash
# Find where OLLAMAMODEL is mounted (typically /run/media/$USER/OLLAMAMODEL or /media/$USER/OLLAMAMODEL)
USB_PATH="/run/media/$USER/OLLAMAMODEL"
[ ! -d "$USB_PATH" ] && USB_PATH="/media/$USER/OLLAMAMODEL"

sudo mkdir -p /usr/share/ollama/.ollama/models
sudo cp -rv "$USB_PATH/models/"* /usr/share/ollama/.ollama/models/
sudo chown -R ollama:ollama /usr/share/ollama/.ollama/models

# Verify the model is installed
ollama list
ollama run gemma4:e2b "Say hello in one sentence."
```

### Option B: Linux User Install (`~/.ollama/models`)
```bash
USB_PATH="/run/media/$USER/OLLAMAMODEL"
[ ! -d "$USB_PATH" ] && USB_PATH="/media/$USER/OLLAMAMODEL"

mkdir -p ~/.ollama/models
cp -rv "$USB_PATH/models/"* ~/.ollama/models/

# Verify the model is installed
ollama list
ollama run gemma4:e2b "Say hello in one sentence."
```

---

## 4. How the Speaker Prepared the `OLLAMAMODEL` USB Drive

```bash
# Copy the local Ollama models directory onto the USB drive:
cp -rv /usr/share/ollama/.ollama/models /run/media/nja/OLLAMAMODEL/
cp -v OFFLINE-MODEL-SETUP.md /run/media/nja/OLLAMAMODEL/README.md
sync
```
