![](https://www.snowdays.it/public/header.jpg?static=true)

# Welcome
Snowdays is the biggest winter sports event organised for students by students in Europe.
Every year at the beginning of March [SCUB (Sport Club University Bolzano)](http://scub.unibz.it/) organises sporting competitions, entertainment and parties in [Bolzano](https://www.google.it/maps/place/39100+Bolzano,+Province+of+Bolzano+-+South+Tyrol/@46.4892366,11.3471577,13z/data=!3m1!4b1!4m5!3m4!1s0x47829c2b419e7049:0x652b694f348b432a!8m2!3d46.4982953!4d11.3547582?hl=en) and surroundings. The organising committee consists solely of volunteers, enthusiastic about sports, snow and mountains. Involved are students from the varying faculties of the UniBz, which is supporting the event.

---
# Index
- [Purpose](#purpose)
- [Structure](#structure)
 - [Database](#database)
 - [Registration platform](#registration-platform)
 - [API](#api)
 - [Android native app](#android-native-app)

---

# Purpose
The purpose of this wiki is to give support to the IT Team of future organisations of Snowdays.

# Structure
## Database
- **Users**: this collection contains all *loggable* participants' object. These objects/profiles do not contain event-related information, but only usernames and hashed passwords needed to login on the platform. Only *internal participants* and *contact people* have one.
- **Participants**: this collection contains every participant's event-related information.
- **IDs**: this collection contains information about participants' student and personal IDs, such as images format, sizes, filenames, locations, owners' IDs, etc.

## Registration platform
### Technologies
- Javascript, Sass, HTML, [HandlebarsJS](http://handlebarsjs.com/)
- [Meteor](https://www.meteor.com) Framework ([NodeJS](https://nodejs.org/en/))
- [jwt.io](https://jwt.io/)
- [CryptoJs](https://jwt.io/)

### Sections
- [Admin section](#admin-section)
- [External section](#external-section)
- [Participant section](#participant-section)

### Admin section
#### Participants list
![Admin list and filters](https://www.snowdays.it/public/screenshots/admin.list1.png?static=true)
![Admin fields](https://www.snowdays.it/public/screenshots/admin.list1.png?static=true)
In this section the staff can _view_, _search_, _filter_, _edit_ and _remove_ every user and participant registered on the website. Snowdays' team is composed of many smaller teams and each one of them may need to filter participants by _activities_ (Sport team), _rental_ options (Logistic team), _food allergies_ (Catering team) and so on. Moreover, it's possible to show/hide almost any field in the table.

#### Add new
![Admin add new](https://www.snowdays.it/public/screenshots/admin.addnew.png?static=true)
In this section the staff can create internal or contact people **users**. During this process both a **user** and a **participant** profile is created. Internals and contact people login as **users** but update their **participant** profiles.

#### Stats
![Admin list](https://www.snowdays.it/public/screenshots/admin.stats.png?static=true)
This section contains basic stats about Snowdays and its participants.

### External section
![External section](https://www.snowdays.it/public/screenshots/external.png?static=true)
Here contact people can update their profiles, set a master password, manually insert basic information about their fellow students and can share a unique URL with a hashed and encrypted token to each of them. They'll be able to complete their own registration once they receive the URL and they insert the correct master password. This is a compulsory step since they do not have a linked **user** profile.

### Participant section
![Participant section](https://www.snowdays.it/public/screenshots/participant.png?static=true)

## API
-> [Link to API docs](https://www.snowdays.it/docs)

## Android native app
[...]

# Credits
- Romeo Bellon ([GitHub](https://github.com/mryraghi), [LinkedIn](https://www.linkedin.com/in/romeobellon/))
- Daniel Morandini ([GitHub](https://github.com/danielmorandini), [LinkedIn](https://www.linkedin.com/in/daniel-morandini-224a3586/))
- Alessandro Piccoli ([GitHub](https://github.com/alpicco))