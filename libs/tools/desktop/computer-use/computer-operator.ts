/**
 * the file is copied from https://github.com/e2b-dev/surf/blob/main/lib/streaming/anthropic.ts
 */

import { Sandbox } from '@e2b/desktop';
import { ResolutionScaler } from './resolution';

interface ComputerActionParams {
  /**
   * - `key`: Press a key or key-combination on the keyboard.
   *   - This supports xdotool's `key` syntax.
   *   - Examples: "a", "Return", "alt+Tab", "ctrl+s", "Up", "KP_0" (for the numpad 0 key).
   * - `hold_key`: Hold down a key or multiple keys for a specified duration (in seconds). Supports the same syntax as `key`.
   * - `type`: Type a string of text on the keyboard.
   * - `cursor_position`: Get the current (x, y) pixel coordinate of the cursor on the screen.
   * - `mouse_move`: Move the cursor to a specified (x, y) pixel coordinate on the screen.
   * - `left_mouse_down`: Press the left mouse button.
   * - `left_mouse_up`: Release the left mouse button.
   * - `left_click`: Click the left mouse button at the specified (x, y) pixel coordinate on the screen. You can also include a key combination to hold down while clicking using the `text` parameter.
   * - `left_click_drag`: Click and drag the cursor from `start_coordinate` to a specified (x, y) pixel coordinate on the screen.
   * - `right_click`: Click the right mouse button at the specified (x, y) pixel coordinate on the screen.
   * - `middle_click`: Click the middle mouse button at the specified (x, y) pixel coordinate on the screen.
   * - `double_click`: Double-click the left mouse button at the specified (x, y) pixel coordinate on the screen.
   * - `triple_click`: Triple-click the left mouse button at the specified (x, y) pixel coordinate on the screen.
   * - `scroll`: Scroll the screen in a specified direction by a specified amount of clicks of the scroll wheel, at the specified (x, y) pixel coordinate. DO NOT use PageUp/PageDown to scroll.
   * - `wait`: Wait for a specified duration (in seconds).
   * - `screenshot`: Take a screenshot of the screen.
   */
  action: 'key' | 'hold_key' | 'type' | 'cursor_position' | 'mouse_move' | 'left_mouse_down' | 'left_mouse_up' | 'left_click' | 'left_click_drag' | 'right_click' | 'middle_click' | 'double_click' | 'triple_click' | 'scroll' | 'wait' | 'screenshot';
  /**
   * (x, y): The x (pixels from the left edge) and y (pixels from the top edge) coordinates to move the mouse to. Required only by `action=mouse_move` and `action=left_click_drag`.
   */
  coordinate?: [number, number];
  /**
   * The duration to hold the key down for. Required only by `action=hold_key` and `action=wait`.
   */
  duration?: number;
  /**
   * The number of 'clicks' to scroll. Required only by `action=scroll`.
   */
  scroll_amount?: number;
  /**
   * The direction to scroll the screen. Required only by `action=scroll`.
   */
  scroll_direction?: 'up' | 'down' | 'left' | 'right';
  /**
   * (x, y): The x (pixels from the left edge) and y (pixels from the top edge) coordinates to start the drag from. Required only by `action=left_click_drag`.
   */
  start_coordinate?: [number, number];
  /**
   * Required only by `action=type`, `action=key`, and `action=hold_key`. Can also be used by click or scroll actions to hold down keys while clicking or scrolling.
   */
  text?: string;
}

export class ComputerOperator {
  private desktop: Sandbox
  private resolutionScaler: ResolutionScaler

  constructor(desktop: Sandbox, resolutionScaler: ResolutionScaler) {
    this.desktop = desktop;
    this.resolutionScaler = resolutionScaler
  }

  async executeAction(action: ComputerActionParams) {
    switch (action.action) {
      case "screenshot": {
        // that explicit screenshot actions are no longer necessary
        break;
      }

      case "double_click": {
        const [x, y] = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );
        if (action.text) {
          await this.desktop.moveMouse(x, y);
          await this.desktop.press(action.text);
        }
        await this.desktop.doubleClick(x, y);
        break;
      }

      case "triple_click": {
        const [x, y] = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );

        await this.desktop.moveMouse(x, y);
        if (action.text) {
          await this.desktop.press(action.text);
        }
        await this.desktop.leftClick();
        await this.desktop.leftClick();
        await this.desktop.leftClick();
        break;
      }

      case "left_click": {
        const [x, y] = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );

        if (action.text) {
          await this.desktop.moveMouse(x, y);
          await this.desktop.press(action.text);
        }
        await this.desktop.leftClick(x, y);
        break;
      }

      case "right_click": {
        const [x, y] = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );

        if (action.text) {
          await this.desktop.moveMouse(x, y);
          await this.desktop.press(action.text);
        }
        await this.desktop.rightClick(x, y);
        break;
      }

      case "middle_click": {
        const [x, y] = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );

        if (action.text) {
          await this.desktop.moveMouse(x, y);
          await this.desktop.press(action.text);
        }
        await this.desktop.middleClick(x, y);
        break;
      }

      case "type": {
        await this.desktop.write(action.text as string);
        break;
      }

      case "key": {
        await this.desktop.press(action.text as string);
        break;
      }

      case "hold_key": {
        await this.desktop.press(action.text as string);
        break;
      }

      case "mouse_move": {
        const [x, y] = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );

        await this.desktop.moveMouse(x, y);
        break;
      }

      case "left_mouse_down": {
        break;
      }

      case "left_mouse_up": {
        break;
      }

      case "left_click_drag": {
        const start = this.resolutionScaler.scaleToOriginalSpace(
          action.start_coordinate as [number, number]
        );
        const end = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );

        await this.desktop.drag(start, end);
        break;
      }

      case "scroll": {
        const [x, y] = this.resolutionScaler.scaleToOriginalSpace(
          action.coordinate as [number, number]
        );

        const direction = action.scroll_direction;
        const amount = action.scroll_amount;

        await this.desktop.moveMouse(x, y);

        if (action.text) {
          await this.desktop.press(action.text);
        }

        await this.desktop.scroll(direction === "up" ? "up" : "down", amount);
        break;
      }

      case "wait": {
        await this.sleep(action.duration as number * 1000);
        break;
      }

      case "cursor_position": {
        break;
      }

      default: {
      }
    }
  }

  async takeScreenshot(): Promise<Buffer> {
    return await this.resolutionScaler.takeScreenshot();
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

