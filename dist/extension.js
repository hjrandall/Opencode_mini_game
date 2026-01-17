"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
class AvatarViewProvider {
    context;
    static viewType = 'opencodeAvatar.view';
    view;
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist-webview'),
            ],
        };
        webviewView.webview.html = this.getHtml(webviewView.webview);
    }
    show() {
        void vscode.commands.executeCommand('opencodeAvatar.view.focus');
    }
    getHtml(webview) {
        const webviewScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist-webview', 'main.js'));
        const turtleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'Turtle.glb'));
        const nonce = getNonce();
        return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <title>Opencode Avatar</title>
    <style>
      html, body { height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden; background: transparent; }
      #root { position: absolute; inset: 0; }
      canvas { display: block; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}">
      window.__AVATAR_MODEL_URI__ = ${JSON.stringify(turtleUri.toString())};
    </script>
    <script nonce="${nonce}" src="${webviewScriptUri}"></script>
  </body>
</html>`;
    }
}
function activate(context) {
    const provider = new AvatarViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(AvatarViewProvider.viewType, provider, {
        webviewOptions: {
            retainContextWhenHidden: true,
        },
    }));
    context.subscriptions.push(vscode.commands.registerCommand('opencodeAvatar.show', () => provider.show()));
}
function deactivate() { }
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=extension.js.map