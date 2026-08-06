# v0.18.14 physical-device acceptance

Test on the deployed iPhone build:

1. Connect a hardware keyboard or use VoiceOver navigation and activate **Skip to main content**.
2. Open and close a manager dialog. Confirm focus enters the dialog, Escape closes it, and focus returns to the opening control.
3. Open Employee **More**. Confirm focus stays inside until closed and returns to More.
4. Open Search and Notifications. Confirm each trigger announces expanded/collapsed state.
5. Trigger a save or approval. Confirm the control cannot be submitted twice and completion is announced once.
6. Enable Reduce Motion in iOS Accessibility settings and confirm transitions become effectively immediate.
7. Check all icon-only controls have understandable VoiceOver labels.
