import { useState, useMemo } from 'react';
import { Code2, MonitorPlay, Sparkles } from 'lucide-react';
import { parseLuaUI } from './parser';
import { LuaComponentRenderer } from './Renderer';

const DEFAULT_LUA_CODE = `-- Create ScreenGui
local screenGui = Instance.new("ScreenGui")

-- Create Main Frame
local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 300, 0, 400)
mainFrame.Position = UDim2.new(0.5, -150, 0.5, -200)
mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

-- Create Title Label
local titleLabel = Instance.new("TextLabel")
titleLabel.Size = UDim2.new(1, 0, 0, 50)
titleLabel.Position = UDim2.new(0, 0, 0, 0)
titleLabel.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
titleLabel.Text = "Login to Continue"
titleLabel.TextSize = 20
titleLabel.BorderSizePixel = 0
titleLabel.Parent = mainFrame

-- Create Username Input
local usernameInput = Instance.new("TextBox")
usernameInput.Size = UDim2.new(1, -40, 0, 40)
usernameInput.Position = UDim2.new(0, 20, 0, 80)
usernameInput.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
usernameInput.TextColor3 = Color3.fromRGB(200, 200, 200)
usernameInput.Text = "Username"
usernameInput.TextSize = 14
usernameInput.BorderSizePixel = 1
usernameInput.BorderColor3 = Color3.fromRGB(60, 60, 80)
usernameInput.Parent = mainFrame

-- Create Login Button
local loginBtn = Instance.new("TextButton")
loginBtn.Size = UDim2.new(1, -40, 0, 45)
loginBtn.Position = UDim2.new(0, 20, 1, -65)
loginBtn.BackgroundColor3 = Color3.fromRGB(0, 120, 255)
loginBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
loginBtn.Text = "LOGIN"
loginBtn.TextSize = 16
loginBtn.BorderSizePixel = 0
loginBtn.Parent = mainFrame
`;

function App() {
  const [code, setCode] = useState(DEFAULT_LUA_CODE);

  // Parse code on change
  const parsedUI = useMemo(() => {
    try {
      return parseLuaUI(code);
    } catch (e) {
      console.error("Failed to parse Lua UI", e);
      return [];
    }
  }, [code]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <Sparkles className="icon" />
          LuaUI Previewer
        </h1>
      </header>

      <main className="app-main">
        {/* Editor Panel */}
        <section className="panel editor-panel">
          <div className="panel-header">
            <Code2 className="icon" />
            <span>Lua Code (Roblox Format)</span>
          </div>
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </section>

        {/* Preview Panel */}
        <section className="panel preview-panel">
          <div className="panel-header">
            <MonitorPlay className="icon" />
            <span>Live Preview</span>
          </div>
          <div className="preview-container">
            <div className="preview-canvas">
              {parsedUI.map((instance, idx) => (
                <LuaComponentRenderer key={idx} instance={instance} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
