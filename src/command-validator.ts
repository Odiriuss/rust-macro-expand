import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import {
  ValidateDocumentUriOptions,
  ValidateDocumentUriResult,
  ValidateDocumentOptions,
  ValidateCommandResult,
  ValidateCustomCommandOptions,
  ValidateCustomCommandResult,
} from "./types";

const langKey = "rust";
const commandText =
  "Enter cargo expand command, example: 'bar::foo' will translate to => 'cargo expand bar::foo'";
export const extensionScheme = "rustexpand";

/**
 * Validates if Cargo.toml exists
 * @param {vscode.TextDocument} document - The document to validate.
 * @returns {string} the path if the document is valid otherwise null
 */
export function validateCargo(document: vscode.TextDocument): string | null {
  let cargoFound = false;
  let cargoPath: string | null = null;
  let dir = path.dirname(document.fileName);
  let dirs = dir.split(path.sep);

  while (!cargoFound) {
    const dirPath = dirs.join(path.sep);
    let files = fs.readdirSync(dirPath);

    let cargoFile = files.find((x) => x.includes("Cargo.toml"));
    if (cargoFile) {
      cargoPath = path.join(dirPath, cargoFile).replace(cargoFile, "");
      cargoFound = true;
      break;
    }

    if (!dirs.pop()) {
      break;
    }
  }

  if (!cargoFound) {
    vscode.window.showErrorMessage(
      "🦀 Cargo.toml was not found! Please use Rust Expand Options instead and specify the path! 🦀"
    );
  }

  return cargoPath;
}

/**
 * Validates document uri according to passed in options
 * @param {ValidateDocumentUriOptions} options - validation options
 * @see {@link ValidationDocumentUriInput}.
 * @returns {ValidateDocumentUriResult} The validation result or null if validation failed
 * @see {@link ValidationDocumentUriResult}.
 */
export async function validateDocumentUri(
  options: ValidateDocumentUriOptions
): Promise<ValidateDocumentUriResult | null> {
  let dir = path.dirname(options.document.fileName);
  const fileName = options.document.fileName.replace(dir, "").replace(path.sep, "");

  let uriPath = `🦀 ${fileName}`;
  let description = "[Expanded]";

  if (options.isCrate) {
    const cargoContent = fs.readFileSync(path.join(options.cargoPath, "Cargo.toml")).toString();
    const regex = new RegExp('(?:[package](?:(?:.|\n)*)(?:name.*=.*"(?<cargoname>.*)"))');
    let result = cargoContent.match(regex);

    if (result && result.groups && result.groups.cargoname) {
      uriPath = `🦀 ${result.groups.cargoname} 🦀.rs`;
      description = `[Expanded Crate]`;
    } else {
      vscode.window.showErrorMessage("🦀 Could not parse crate name from Cargo.toml! 🦀");
      return null;
    }
  }

  const uri = vscode.Uri.parse(`rustexpand:${description} ${uriPath}`);

  return {
    cargoPath: options.cargoPath,
    dir,
    uri,
  };
}

/**
 * Validates if the current document can be expanded according to passed in options
 * @param {ValidateDocumentOptions} options - validation options
 * @see {@link ValidateDocumentOptions}.
 * @returns {vscode.TextDocument} The validated document or null if validation failed
 * @see {@link vscode.TextDocument}.
 */
export function validateDocument(options: ValidateDocumentOptions): vscode.TextDocument | null {
  if (vscode.window.activeTextEditor) {
    const { document } = vscode.window.activeTextEditor;
    if (options.checkLang && document.languageId !== langKey) {
      vscode.window.showErrorMessage(
        "🦀 You can only run Rust Expand Macro in Rust (.rs) files! 🦀"
      );
      return null;
    }

    if (options.checkScheme && document.uri.scheme !== options.checkScheme) {
      vscode.window.showErrorMessage(
        "🦀 Cannot run the command in a file that was not created by Rust Expand Macro! 🦀"
      );
      return null;
    }

    if (options.checkNotScheme && document.uri.scheme === options.checkNotScheme) {
      vscode.window.showErrorMessage(
        "🦀 Cannot run the command in a file that was created by Rust Expand Macro! Please use Rust Expand Reload or Rust Expand Path instead and specify the path! 🦀"
      );
      return null;
    }

    return document;
  } else {
    vscode.window.showErrorMessage(
      "🦀 Cannot expand when no active editor is available! Please use Rust Expand Path instead and specify the path! 🦀"
    );

    return null;
  }
}

/**
 * Validates the current expand command according to passed in options
 * @param {boolean} isCrate - is the command a crate command, crate commands are treated as global, globals are
 * auto expanded if auto save is enabled
 * @returns {ValidateCommandResult} The validation result or null if validation failed
 * @see {@link ValidateCommandResult}.
 */
export async function validateCommand(isCrate?: boolean): Promise<ValidateCommandResult | null> {
  const validation = validateDocument({ checkLang: true });
  if (validation) {
    const doc = validation as vscode.TextDocument;
    const cargoPath = await validateCargo(doc);
    if (cargoPath) {
      const docUri = await validateDocumentUri({ document: doc, cargoPath, isCrate });
      if (docUri) {
        return {
          fileName: doc.fileName,
          cargoPath: docUri.cargoPath,
          uri: docUri.uri,
        };
      }
    }
  }

  return null;
}

/**
 * Validates custom command input
 * @returns {string} The command string if the command is valid otherwise null
 */
export async function validateCommandInput(): Promise<string | null> {
  let command = (await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt: commandText,
  })) as string | null;

  if (!command) {
    command = null;
    vscode.window.showErrorMessage("🦀 Command must be set !!! 🦀");
  } else {
    command = `cargo expand ${command}`.trim();
  }

  return command;
}

/**
 * Validates custom command path input
 * @returns {string} The path string if the path is valid otherwise null
 */
export async function validatePathInput(): Promise<string | null> {
  let path = (await vscode.window.showInputBox({
    ignoreFocusOut: true,
    prompt:
      "Enter an absolute path where the cargo command will execute, example: f:\\foo\\bar ...",
  })) as string | null;

  if (!path || !fs.existsSync(path)) {
    path = null;
    vscode.window.showErrorMessage("🦀 Please enter a valid absolute system path !!! 🦀");
  }

  return path;
}

/**
 * Validates the custom command according to passed in options
 * @param {ValidateCustomCommandOptions} options - validation options
 * @see {@link ValidateCustomCommandInput}.
 * @returns {ValidateCustomCommandResult} The validation result or null if validation failed
 * @see {@link ValidateCustomCommandResult}.
 */
export async function validateCustomCommand(
  options: ValidateCustomCommandOptions
): Promise<ValidateCustomCommandResult | null> {
  let path: string | null = null;
  const uri = `${options.command.replace("cargo expand", "")} 🦀.rs`;

  if (options.path) {
    path = options.path;
  } else {
    const docValidation = await validateDocument({
      checkLang: true,
      checkNotScheme: path ? undefined : extensionScheme,
    });
    if (docValidation) {
      const cargoPath = validateCargo(docValidation);
      if (cargoPath) {
        path = cargoPath;
      }
    }
  }

  return path
    ? {
        path,
        uri: vscode.Uri.parse(`rustexpand:[Expanded Custom] ${uri}`),
        fileName: uri,
      }
    : null;
}

/**
 * Validates module path
 * @returns {string} The module string
 */
export async function validateModPath(command: ValidateCommandResult): Promise<string> {
  /*
  Example:
  cargoPath:'f:\\Private\\Rust\\expand_macros\\'
  fileName:'f:\\Private\\Rust\\expand_macros\\src\\inner\\inner_expanded.rs'

  Example:
  cargoPath:'f:\\Private\\Rust\\expand_macros\\'
  fileName:'f:\\Private\\Rust\\expand_macros\\src\\inner\\mod.rs'
  */
  let modPath = command.fileName
    .replace(command.cargoPath, "")
    .replace(`src${path.sep}`, "")
    .replace(`${path.sep}mod.rs`, "")
    .replace(".rs", "")
    .replace(path.sep, "::");

  return modPath.trim();
}
