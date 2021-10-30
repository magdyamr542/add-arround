import * as vscode from "vscode";
const getSelectedOrUndefined = (range: vscode.Range) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return undefined;
  }
  const selection = editor.selection;
  if (!selection) {
    return undefined;
  }
  if (range.end.compareTo(selection.end) < 0) {
    return selection;
  }
  return undefined;
};
const getPositionsToSurround = ():
  | {
      start: vscode.Position;
      end: vscode.Position;
    }
  | undefined => {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const cursorPosition = editor?.selection.start;
    if (cursorPosition) {
      const range = editor.document.getWordRangeAtPosition(cursorPosition);
      if (range) {
        const selected = getSelectedOrUndefined(range);
        if (!selected) {
          return range;
        } else {
          return selected;
        }
      } else {
        return editor.selection;
      }
    }
  }
  return undefined;
};
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "add-arround.insertTemplate",
    () => {
      const positions = getPositionsToSurround();
      if (!positions) {
        return;
      }

      vscode.window
        .showInputBox({
          prompt: "Enter your template to surround the selected text with",
          placeHolder: "",
        })
        .then((value) => {
          if (!value) {
            return;
          }
          vscode.window.activeTextEditor?.edit((editBuilder) => {
            const { startText, endText } = getValue(value);
            editBuilder.insert(positions.start, startText);
            editBuilder.insert(positions.end, endText);
          });
        });
    }
  );

  context.subscriptions.push(disposable);
}

export const getValue = (toWrite: string) => {
  let startText = "";
  let endText = "";
  const valueMap: Record<string, string> = {
    "{": "}",
    "[": "]",
    "(": ")",
    "<": ">",
  };
  for (const char of [...toWrite]) {
    startText += char;
    if (valueMap[char] !== undefined) {
      const oppositeChar = valueMap[char];
      endText = oppositeChar + endText;
    } else {
      endText = char + endText;
    }
  }

  return {
    startText,
    endText,
  };
};
// this method is called when your extension is deactivated
export function deactivate() {}
