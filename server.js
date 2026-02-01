const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const crypto = require('crypto');
const app = express();

app.use(cors());
// // app.use(cors({
// //   origin: "*",
// //   methods: ["GET", "POST", "OPTIONS"],
// //   allowedHeaders: ["Content-Type"]
// // }));

// // app.options("/execute", cors()); // 🔥 THIS IS CRITICAL

// // app.use(express.json());
// const app = express();

// // ✅ CORS FIRST
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type");

//   // 🔥 Handle preflight HERE
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });

app.use(express.json());


const RUNTIMES = {
    "python": { image: "python:3.9-alpine", cmd: "python", ext: "py" },
    "javascript": { image: "node:18-alpine", cmd: "node", ext: "js" },
    "go": { image: "golang:1.19-alpine", cmd: "go run", ext: "go" },
    // FIX: Compile to /tmp/app (internal storage) to bypass volume permission issues
    "c": { image: "gcc:latest", cmd: "sh -c 'gcc /code/source.c -o /tmp/app && /tmp/app'", ext: "c" }
};

app.post('/execute', (req, res) => {
    let language, code;
    
    // Support Standard Piston Format (files array)
    if (req.body.files && Array.isArray(req.body.files)) {
        language = req.body.language;
        code = req.body.files[0].content;
    } 
    // Support Simple Format
    else {
        language = req.body.language;
        code = req.body.code;
	console.log("hello");
    }

    const config = RUNTIMES[language];
    if (!config) return res.status(400).send({ message: "Unsupported language" });
    console.log(`Executing code in language: ${language}`);
    const id = crypto.randomUUID();
    const filename = `source.${config.ext}`;
    const hostPath = `/tmp/piston-jobs/${id}`; 

    fs.mkdirSync(hostPath, { recursive: true });
    fs.writeFileSync(`${hostPath}/${filename}`, code);

console.log("Hello");
    // Limit memory to 128MB to prevent crashes
    const dockerCmd = `docker run --rm --memory=128m --network none -v ${hostPath}:/code -w /code ${config.image} ${config.cmd} ${filename}`;

    exec(dockerCmd, { timeout: 5000 }, (error, stdout, stderr) => {
        fs.rmSync(hostPath, { recursive: true, force: true });

        res.json({
            language: language,
            run: {
                stdout: stdout || "",
                stderr: stderr || (error ? error.message : ""),
                output: (stdout || "") + (stderr || ""),
                code: error ? 1 : 0,
                signal: null
            }
        });
    });
    console.log(`Job ID: ${id} - Code executed`);
    console.log(`Job ID: ${id} - Code executed`);
	console.log("hello");
});

app.listen(3000, () => console.log('Mini-Piston listening on port 3000'));
