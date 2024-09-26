<!-- DATABASE.MD -->
# Database

This markdown is dedicated to showing the Mongo database structure
for tunetracker.

PK = Primary Key
FK = Foreign Key
NN = Not Null
BOOL = Boolean

## User

They will currently only be able to log in through a google account,
this is just due to the convience of not having to create a log up/
sign in system.

- userId (PK, NN): a unique random hash (probably non-incremental)
- email (NN): a email for the user, gotten from their google login
- firstName (NN): first name of the user, gotten from their google login
- lastName (NN): last name of the user, gotten from their google login
- picture (NN): reference to picture of the user
- tuneStates: array of objects storing each tunes' state for the user

  - tuneId (NN)
  - state (NN)
  - lastPractice
  - dateAdded
  - comments
  - hidden (BOOL)

- setStates: array of objects storing each sets' state for the user

  - setId (NN)
  - state (NN)
  - lastPractice
  - dateAdded
  - comments
  - hidden (BOOL)

- sessionStates: array of objects storing each sessions' state for the user

  - sessionId (NN)
  - state (NN)
  - dateAdded
  - comments
  - hidden (BOOL)

## Tunes

This will host the list of tunes created by the users.

- tuneId (PK, NN): a unique random hash (probably non-incremental)
- userId (FK, NN): reference to the user that added the tune
- tuneName (NN): name of the tune
- tuneType (NN): type of tune (jig, reel, hornpipe, etc.)
- author: author of the tune
- recordingRef: a reference to the recording for the tune
  (stored in a folder on the server)
- links: array of links appropraite for the tune
- comments: allows user to write feelings/ideas

## Sets

Sets hold 2 - n amount of tunes, and are created by users.

- setId (PK, NN): a unique random hash (probably non-incremental)
- userId (FK, NN): reference to the user that added the tune
- setName: name of the set
- tuneIds (FK, NN): array of tuneIds referencing different tunes
  (order is important)
- recordingRef: a reference to the recording for the tune
  (stored in a folder on the server)
- comments: allows user to write feelings/ideas

## Sessions

Sessions hold sets and tunes, and are created by users.

- sessionId (PK, NN): a unique random hash (probably non-incremental)
- userId (FK, NN): reference to the user that added the tune
- sessionName: name of the session
- tuneIds (FK, NN): array of tuneIds referencing different tunes
- setIds (FK, NN): array of setIds referencing different sets
- comments: allows user to write feelings/ideas
