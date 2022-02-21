import * as vscode from "vscode";
import { extensionScheme } from "./command-validator";
import {
  expandCommandHandler,
  expandCrateHandler,
  expandHandler,
  expandPathHandler,
  expandReloadHandler,
  macroTextProvider,
} from "./command-handler";

//Entry point for the extension
export function activate({ subscriptions }: vscode.ExtensionContext) {
  //Register a content provider for the rustexpand-scheme
  subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(extensionScheme, macroTextProvider)
  );

  //Register out command handlers
  subscriptions.push(
    vscode.commands.registerCommand(expandHandler.commandName, expandHandler.command),
    vscode.commands.registerCommand(expandCrateHandler.commandName, expandCrateHandler.command),
    vscode.commands.registerCommand(expandReloadHandler.commandName, expandReloadHandler.command),
    vscode.commands.registerCommand(expandCommandHandler.commandName, expandCommandHandler.command),
    vscode.commands.registerCommand(expandPathHandler.commandName, expandPathHandler.command)
  );
}
