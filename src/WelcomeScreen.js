import React from 'react';
import './App.css';

function WelcomeScreen({onLogin}) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const sendToDatabase = async (data) => {
        try {
            //TODO: Change the link to the PostgreSQL link
            const response = await fetch('https://link to change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log("Success:", result);
        } catch (error) {
            console.error("Error connecting to PostgreSQL:", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const userLoginData = {
            user_email: email,
            user_password: password,
            login_timestamp: new Date().toISOString()
        };

        sendToDatabase(userLoginData);
        onLogin();
    };

    return (
        <div className="app-container">
            <div className="login-box">
                <h2>RisyShiny</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email: </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password: </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Start game
                    </button>
                </form>
            </div>
        </div>
    );
}

export default WelcomeScreen;