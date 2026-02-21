const http = require('http');
const fs = require('fs');

const authData = JSON.stringify({
    username: "admin",
    password: "admin"
});

const req = http.request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': authData.length
    }
}, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const json = JSON.parse(body);
        const token = json.data.token;

        // Now test create reminder
        const remData = JSON.stringify({
            title: "Test Reminder",
            type: "personal",
            message: "Test message",
            dateTime: "2026-05-15T15:00:00",
            status: "scheduled",
            channels: ["email"],
            repeat: "none",
            contact: {
                name: "Test Person",
                email: "test@example.com",
                phone: ""
            }
        });

        const remReq = http.request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/reminders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, (remRes) => {
            let rBody = '';
            remRes.on('data', d => rBody += d);
            remRes.on('end', () => {
                const createResp = JSON.parse(rBody);

                fs.writeFileSync('out_utf8.json', JSON.stringify(createResp, null, 2));
            });
        });
        remReq.write(remData);
        remReq.end();
    });
});
req.write(authData);
req.end();
