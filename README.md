# nuke-modal

Nuke modal dialogs on web pages

## Concept

The concept here is that the web is full of modal and non-modal dialogs that one must - with fine motor control - click "I agree", etc to dismiss.

If we can keep track of the modals in a distributed manner, via an extension that identifies modals and allows you to dismiss them easily...

We can also report these URLs and the `CSS selector` needed to automatically dsmiss these dialogs to a `CRDT`[1] in `IPFS`[2] and of course locally in case one is not interested in the distributed problem solving space.

### TODOs

* Package index.js in to browser extensions
* Keep track of the modals dismissed locally in `IndexDB`
* Test for local IPFS gateway to post a newly-discovered modal CSS Selector and URL (or perhaps just the domain name) to a CRDT DB
* When the browser starts each URL visited is compared to the CRDT to be able to automatically discover the modals and dismiss them automatically.


[1] CRDT: https://scholar.google.pt/citations?view_op=view_citation&hl=en&user=NAUDTpMAAAAJ&citation_for_view=NAUDTpMAAAAJ:M3ejUd6NZC8C

[2] IPFS: https://ipfs.io
