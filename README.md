# Discovery-Health-Bot

A React + Vite frontend with a Python (FastAPI) backend that turns the `Authi Bot.ipynb` notebook into a web assistant for Discovery Health members.

## What it does

- Interprets member questions with a lightweight `AuthiEngine`-style ruleset
- Surfaces treatment basket guidance for diabetes and asthma
- Shows chronic medicine support cues
- Summarises hospital network guidance from the supplied PDFs

## Run locally (full stack)

```bash
npm install
python3 -m pip install -r requirements.txt
npm run dev
```

## Build

The app runs at `http://localhost:5173` and the backend API runs at `http://localhost:8000`.

## Run backend only

```bash
python3 -m pip install -r requirements.txt
npm start
```

## Notes

- The backend reads and indexes the supplied Discovery Health PDFs on startup.
- The linked Figma design could not be fetched through the available MCP because the file returned a permission error.