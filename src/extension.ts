import * as vscode from 'vscode';

class AvatarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'opencodeAvatar.view';

  private view?: vscode.WebviewView;

  public constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
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

  public show() {
    void vscode.commands.executeCommand('opencodeAvatar.view.focus');
  }

  private getHtml(webview: vscode.Webview): string {
    const webviewScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist-webview', 'main.js'),
    );

    const turtleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'Turtle.glb'),
    );

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

export function activate(context: vscode.ExtensionContext) {
  const provider = new AvatarViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(AvatarViewProvider.viewType, provider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('opencodeAvatar.show', () => provider.show()),
  );

}

export function deactivate() {}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
