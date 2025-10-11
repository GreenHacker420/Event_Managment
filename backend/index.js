import express from 'express';
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: "server is running"
    })
})

app.listen(5000, () => {
    console.log("server is running at port 5000");
})