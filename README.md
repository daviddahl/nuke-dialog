# nuke-dialog

Nuke cookie / GDPR dialogs on web pages

## Concept

The concept here is that the web is full of un-desireable dialogs that one must - with fine motor control - click "I agree, consent, yes master", etc to dismiss.

Most of the logic employed in `nuke-dialog` is via a `reverse css lookup` where we find the selectors to target via the css rules themselves.

The secondary mechanism for discovery is via a `MutationObserver` that looks for nodes that change: class and attribute changes or new nodes that are created wit z-index > 0;

This is still naive as it depends on the textContent of `cookie` to exist in the nodes that we are targeting via the css or mutations.

### TODOs

* Package index.js in to browser extensions
* ~~Keep track of the modals dismissed locally in `IndexDB`, check the cache for what to dismiss before running the heavy-ish script that potentially does XHRs etc~~
* ~~"Mark modal" functionality: allow users to right click to mark a modal DOM node manually.~~
* Discover modals that do not have z-index style rules. Ideas here will be great to hear about.
* I18N: The miniscule UI and string testing should be localized as needed.

#### MAYBEs

* ~~Test for local IPFS gateway to post a newly-discovered modal CSS Selector and URL (or perhaps just the domain name) to a CRDT DB~~
* ~~When the browser starts each URL visited is compared to the CRDT to be able to automatically discover the modals and dismiss them automatically.~~

#### ML model?

Is there a machine learning model that could be applied to the DOM to discover dialogs or other un-desired UX in web pages?