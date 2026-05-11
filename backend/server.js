const app = require('./app');
const { initPushScheduler } = require('./utils/pushScheduler');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initPushScheduler();
});
