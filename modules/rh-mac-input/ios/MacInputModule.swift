import ExpoModulesCore
import UIKit

@ExpoModule("MacInput")
public class MacInputModule: Module {
  @JS
  func isiOSAppOnMac() -> Bool {
    return rhIsIosAppOnMac()
  }

  @Event("onKey")
  var onKey: (String) -> Void

  public override func didCreate() {
    RhMacKeys.shared.emit = { [weak self] key in
      self?.onKey(key)
    }
    guard rhIsIosAppOnMac() else { return }
    DispatchQueue.main.async {
      RhMacKeys.shared.install()
    }
  }
}

func rhIsIosAppOnMac() -> Bool {
  #if os(iOS)
  if #available(iOS 14.0, *) {
    return ProcessInfo.processInfo.isiOSAppOnMac
  }
  #endif
  return false
}

/// Key commands are installed only when this binary is the iOS app running on a Mac.
/// iPhone and tvOS never exchange the method.
final class RhMacKeys {
  static let shared = RhMacKeys()
  var emit: ((String) -> Void)?
  private var installed = false

  func install() {
    guard !installed else { return }
    installed = true
    let cls: AnyClass = UIViewController.self
    guard let original = class_getInstanceMethod(cls, #selector(getter: UIViewController.keyCommands)),
          let swapped = class_getInstanceMethod(cls, #selector(UIViewController.rh_keyCommands)) else { return }
    method_exchangeImplementations(original, swapped)
  }

  func send(_ key: String) {
    if key != "escape" && key != "find" && rhTextEditing() { return }
    emit?(key)
  }
}

private func rhTextEditing() -> Bool {
  let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
  let window = scenes.flatMap { $0.windows }.first { $0.isKeyWindow } ?? scenes.flatMap { $0.windows }.first
  guard let root = window else { return false }
  return rhFindEditor(root)
}

private func rhFindEditor(_ view: UIView) -> Bool {
  if view.isFirstResponder && (view is UITextField || view is UITextView) { return true }
  for child in view.subviews where rhFindEditor(child) { return true }
  return false
}

extension UIViewController {
  @objc func rh_keyCommands() -> [UIKeyCommand]? {
    let existing = rh_keyCommands()
    guard rhIsIosAppOnMac() else { return existing }
    return (existing ?? []) + RhMacKeys.commands
  }

  @objc func rh_macKey(_ command: UIKeyCommand) {
    RhMacKeys.shared.send(command.propertyList as? String ?? "")
  }
}

private extension RhMacKeys {
  static var commands: [UIKeyCommand] {
    let pairs: [(String, String, UIKeyModifierFlags)] = [
      (UIKeyCommand.inputEscape, "escape", []),
      (UIKeyCommand.inputUpArrow, "up", []),
      (UIKeyCommand.inputDownArrow, "down", []),
      (UIKeyCommand.inputLeftArrow, "left", []),
      (UIKeyCommand.inputRightArrow, "right", []),
      ("\t", "shift-tab", .shift),
      ("\t", "tab", []),
      ("\r", "enter", []),
      (" ", "space", []),
      ("f", "find", .command),
    ]
    return pairs.map { input, name, flags in
      let command = UIKeyCommand(input: input, modifierFlags: flags, action: #selector(UIViewController.rh_macKey(_:)))
      command.propertyList = name
      return command
    }
  }
}
