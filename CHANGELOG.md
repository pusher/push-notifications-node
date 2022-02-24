# Changelog

## 1.2.5

* [CHANGED] Added `data` type for `ApnsPayload`

## 1.2.4

* [CHANGED] Remove some redundant steps from release action

## 1.2.3

* [CHANGED] Switch from Travis CI to GH actions

## 1.2.2

* [REMOVED] `requests` dependency and replaced with standard library

## 1.2.1

* [FIXED] Added missing TypeScript types for web push publish payload

## 1.2.0

* [ADDED] More payload fields to TypeScript bindings (collapse\_key, expiration, etc.)

## 1.1.1

* [FIXED] Fixes double JSON encoding

## 1.1.0

* [ADDED] Support for publishing to Authenticated Users
* [ADDED] TypeScript typings for Authenticated Users
* [DEPRECATED] Deprecates `publish` in favour of `publishToInterests`

## 1.0.1

* [FIXED] Accessing property on undefined object on non-json response

## 1.0.0

* [ADDED] Changelog for GA release
