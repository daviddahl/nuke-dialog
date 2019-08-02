# nuke-modal

Nuke modal dialogs on web pages

## Concept

The concept here is that the web is full of modal and non-modal dialogs that one must - with fine motor control - click "I agree", etc to dismiss.

If we can keep track of the modals in a distributed manner, via an extension that identifies modals and allows you to dismiss them easily...

We can also report these urls and the css selector needed to automatically dsmiss these dialogs to a CRDT[1] in IPFS[2] and of course locally in case one is not interested in the distributed problem solving space

[1] CRDT: https://scholar.google.pt/citations?view_op=view_citation&hl=en&user=NAUDTpMAAAAJ&citation_for_view=NAUDTpMAAAAJ:M3ejUd6NZC8C
[2] IPFS: https://ipfs.io
