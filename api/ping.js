
export default function handler(req, res) {
    res.status(200).json({ status: 'Keep Alive', timestamp: new Date().toISOString() });
}
