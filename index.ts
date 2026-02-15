import Elysia from "elysia";
import { renderMessagesImage, submitMessage } from "./image";

export const app = new Elysia()
  .onError(({error}) => {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  })
  .get("/", async () => {
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>I Was Here - Message Board</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          h1 {
            color: #333;
            text-align: center;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          label {
            font-weight: bold;
            color: #555;
          }
          input, textarea {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
          }
          textarea {
            resize: vertical;
            min-height: 100px;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
          }
          button:hover {
            background-color: #45a049;
          }
          #message-result {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
            display: none;
          }
          #message-result.success {
            background-color: #d4edda;
            color: #155724;
            display: block;
          }
          #message-result.error {
            background-color: #f8d7da;
            color: #721c24;
            display: block;
          }
          .board-image {
            width: 100%;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <h1>Byl jsem tu?!</h1>
        
        <div class="container">
          <h2>Zanech zprávu</h2>
          <form id="messageForm">
            <div>
              <label for="name">Jméno:</label>
              <input type="text" id="name" name="name" required maxlength="100" placeholder="Enter your name">
            </div>
            <div>
              <label for="message">Zpráva:</label>
              <textarea id="message" name="message" required maxlength="500" placeholder="Napiš svou zprávu..."></textarea>
            </div>
            <button type="submit">Odeslat zprávu</button>
            <div id="message-result"></div>
          </form>
        </div>

        <div class="container">
          <h2>Message Board</h2>
          <img src="/board.png" alt="Message Board" class="board-image" id="boardImage">
        </div>

        <script>
          const form = document.getElementById('messageForm');
          const resultDiv = document.getElementById('message-result');
          const boardImage = document.getElementById('boardImage');

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;

            try {
              const response = await fetch('/message', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, message }),
              });

              const result = await response.json();

              if (result.success) {
                resultDiv.textContent = 'Message posted successfully!';
                resultDiv.className = 'success';
                form.reset();
                // Refresh the board image
                boardImage.src = '/board.png?' + new Date().getTime();
              } else {
                resultDiv.textContent = 'Error: ' + result.error;
                resultDiv.className = 'error';
              }
            } catch (error) {
              resultDiv.textContent = 'Error submitting message';
              resultDiv.className = 'error';
            }
          });
        </script>
      </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  })
  .get("/board.png", async () => {
    const imageBuffer = await renderMessagesImage();
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  })
  .post("/message", async ({ body }) => {
    const { name, message } = body as { name: string; message: string };
    
    const result = await submitMessage(name, message);
    return { success: true, id: result.id };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);