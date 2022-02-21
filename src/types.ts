import * as vscode from "vscode";

/**
 * Class representing an expanded document.
 */
export class ExpandedDocument {
  /** The path to Cargo.toml */
  cargoPath: string;
  /**
   * The validated command that was sent to cargo expand
   */
  cargoCommand: string;
  /**
   * The file uri, has to be in rustexpand scheme
   */
  fileUri: vscode.Uri;
  /**
   * The file name to be displayed in vscode
   */
  fileName: string;
  /**
   * If global it will be auto expanded if auto save is enabled, otherwise it will be expanded only if an existing rustexpand file exists
   */
  isGlobal?: boolean;

  /**
   * Create an ExpandedDocument
   * @param {string} cargoPath - @see {@link ExpandedDocument.cargoPath}
   * @param {string} cargoCommand - @see {@link ExpandedDocument.cargoCommand}
   * @param {vscode.Uri} fileUri - @see {@link ExpandedDocument.fileUri}
   * @param {string} fileName - @see {@link ExpandedDocument.fileName}
   * @param {boolean} isGlobal - @see {@link ExpandedDocument.isGlobal}
   */
  constructor(
    cargoPath: string,
    cargoCommand: string,
    fileUri: vscode.Uri,
    fileName: string,
    isGlobal?: boolean
  ) {
    this.cargoPath = cargoPath;
    this.cargoCommand = cargoCommand;
    this.fileUri = fileUri;
    this.fileName = fileName;
    this.isGlobal = isGlobal;
  }
}

/**
 * Class representing a expanded document identifier.
 */
export class ExpandedDocumentIdentifier {
  /**
   * The file uri, has to be in rustexpand scheme
   */
  fileUri: vscode.Uri;

  /**
   * Create a ExpandedDocumentIdentifier.
   * @param {vscode.Uri} fileUri - The file Uri.
   */
  constructor(fileUri: vscode.Uri) {
    this.fileUri = fileUri;
  }
}

/**
 * Interface for extensions settings. These settings are exposed to the user.
 *
 * @interface
 */
export interface ExtensionSettings {
  /**
   * Specifies whether or not to display in the generated output the command sent to cargo expand.
   */
  displayCargoCommand: boolean;
  /**
   * Specifies whether or not to display in the generated output the folder in which the cargo expand command was executed.
   */
  displayCargoCommandPath: boolean;
  /**
   * Specifies whether or not to display the timestamp in the generated output.
   */
  displayTimestamp: boolean;
  /**
   * Specifies whether or not to display warnings in the generated output.
   * Warnings will be displayed as a multiline comment at the top of the generated output.
   */
  displayWarnings: boolean;
  /**
   * Specifies whether or not to display warnings as an action in a notification.
   * After expand has been completed, if there were any warnings you will get a notification with a button which upon click will
   * display the warnings in a spearate window.
   */
  notifyWarnings: boolean;
  /**
   * Specifies whether or not to refresh expanded files on save.
   */
  expandOnSave: boolean;
}

/**
 * Interface for options of document validation.
 *
 * @interface
 */
export interface ValidateDocumentOptions {
  /**
   * Check if active document has rust set as languageId
   */
  checkLang?: boolean;
  /**
   * Check if active document has rustexpand set as scheme
   */
  checkScheme?: string;
  /**
   * Check if active document does not have rustexpand set as scheme
   */
  checkNotScheme?: string;
}

/**
 * Interface for options of document uri validation.
 *
 * @interface
 */
export interface ValidateDocumentUriOptions {
  /**
   * The document to validate
   */
  document: vscode.TextDocument;
  /** The path to Cargo.toml */
  cargoPath: string;
  /**
   * Is the uri to be made for a crate or not. If made for crate it's considered as a
   * global expand and it auto save is enabled all globals are expanded
   */
  isCrate?: boolean;
}

/**
 * Interface for base validation result.
 *
 * @interface
 */
export interface ValidateBaseResult {
  /**
   * The path to Cargo.toml on the system
   */
  cargoPath: string;
  /**
   * The file uri, has to be in rustexpand scheme
   */
  uri: vscode.Uri;
}

/**
 * Interface for result of document uri validation.
 *
 * @interface
 */
export interface ValidateDocumentUriResult extends ValidateBaseResult {
  /**
   * The directory of the current active document
   */
  dir: string;
}

/**
 * Interface for result of command validation.
 *
 * @interface
 */
export interface ValidateCommandResult  extends ValidateBaseResult{
  /**
   * The file name to be displayed in vscode
   */
  fileName: string;
}

/**
 * Interface for options of custom command validation.
 *
 * @interface
 */
export interface ValidateCustomCommandOptions {
  /**
   * The validated command that will be sent to cargo expand
   */
  command: string;
  /**
   * The absolute system path at which the command will be executed.
   * If not set current active document will be used.
   */
  path?: string;
}

/**
 * Interface for result of custom command validation.
 *
 * @interface
 */
export interface ValidateCustomCommandResult {
  /**
   * The absolute system path at which the command will be executed
   */
  path: string;
  /**
   * The file uri, has to be in rustexpand scheme
   */
  uri: vscode.Uri;
  /**
   * The file name to be displayed in vscode
   */
  fileName: string;
}

/**
 * Interface for command handlers.
 *
 * @interface
 */
export interface CommandHandler {
  /**
   * The name of the command it handles
   */
  commandName: string;
  /**
   * The function which gets called on vs code callback
   * @see {@link vscode.commands.registerCommand}.
   */
  command: () => Promise<void>;
}
