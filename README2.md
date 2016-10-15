----------------------------------------------------
Обязательно
----------------------------------------------------

1. Установить Node.js and MongoDB;
2. Установить зависимости из каталога проекта: 
		npm install
3. Установить "httpie" (см "https://httpie.org/#installation")
4. Генерация начального состояния(с одним юзером): 
		node generateData.js
5. Запуск сервера:
		node bin/www 


----------------------------------------------------
API
----------------------------------------------------

1. Запрос, по которому будет генерироваться токен (по паре
username/password), в респонсе должен лежать непосредственно токен
(токен должен храниться в бд);

http POST http://localhost:1337/api/oauth/token grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers username=myapi password=abc1234
---------------------------------------------

2. Регистрация нового пользователя (продумать варианты статусов ответа
согласно модели данных);

http http://localhost:1337/api/users/register @newuser.json
---------------------------------------------

3. Запрос, который возвращает краткую инфу о пользователе-хозяине
токена (id, email, firstName, lastName);

http http://localhost:1337/api/users/info Authorization:"Bearer [TOKEN]"
---------------------------------------------

4. Запрос который отмечает все активные токены текущего юзера как
удаленные;

http http://localhost:1337/api/users/delltokens Authorization:"Bearer [TOKEN]"

---------------------------------------------

5. Возвращает друзей указанного пользователя ([{id, firstName, lastName,
friendshipDuration, friendshipType}]);

http  http://localhost:1337/api/users/friends/[userId] Authorization:"Bearer [TOKEN]"
---------------------------------------------

6. Получение всех зарегистрированных пользователей ([{id,firstName,
lastName}]);

http http://localhost:1337/api/users/all Authorization:"Bearer [TOKEN]"
---------------------------------------------

7. Добавление юзера к юзеру в качестве друга ({friendshipType: ‘1,2,3,4,5’}),
где
1лучшийдруг, 2любовьвсей жизни, 3родственник, 4 друг, 5коллега;

http http://localhost:1337/api/users/tofriends user2fr=[friendId] frtype=[tipeOfFriendship] Authorization:"Bearer [TOKEN]"

---------------------------------------------

8. Запрос, который удаляет друга (по id) у пользователя

http http://localhost:1337/api/users/outfriends user2fr=[friendId] Authorization:"Bearer [TOKEN]"
---------------------------------------------



----------------------------------------------------
Примеры запросов (необязательно):
----------------------------------------------------

Creating and refreshing access tokens:

D:\FREELANCE\node.js\NodeAPI-master>http POST http://localhost:1337/api/oauth/token grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers username=myapi password=abc1234
HTTP/1.1 200 OK
Cache-Control: no-store
Connection: keep-alive
Content-Length: 206
Content-Type: application/json
Date: Thu, 06 Oct 2016 07:00:31 GMT
Pragma: no-cache
Vary: X-HTTP-Method-Override
X-Powered-By: Express

{
    "access_token": "e9c4ac01973ed22bee1c306eec81224208143284ad2cd465bf29b7aa259199b8",
    "expires_in": 3600,
    "refresh_token": "898cc36ded37ea13ce543de8df5c7e91c1ac92c513ab222c27dcd995e4ef457b",
    "token_type": "Bearer"
}

---------------------------------------------
Refreshing access tokens:
D:\FREELANCE\node.js\NodeAPI-master>http POST http://localhost:1337/api/oauth/token grant_type=refresh_token client_id=android client_secret=SomeRandomCharsAndNumbers refresh_token=898cc36ded37ea13ce543de8df5c7e91c1ac92c513ab222c27dcd995e4ef457b
HTTP/1.1 200 OK
Cache-Control: no-store
Connection: keep-alive
Content-Length: 206
Content-Type: application/json
Date: Thu, 06 Oct 2016 07:32:19 GMT
Pragma: no-cache
Vary: X-HTTP-Method-Override
X-Powered-By: Express

{
    "access_token": "5d1b519b777677328bab62a8baf9da1540386bacd5ff1c71646870b0f06833cf",
    "expires_in": 3600,
    "refresh_token": "bce5752915ca7b1201784410fa3306c2bc9910a31fe922c8d4cfa94f2cd4b1ff",
    "token_type": "Bearer"
}

---------------------------------------------

Getting your data:

D:\FREELANCE\node.js\NodeAPI-master>http http://localhost:1337/api/users/info Authorization:"Bearer e9c4ac01973ed22bee1c306eec81224208143284ad2cd465bf29b7aa259199b8"
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 65
Content-Type: application/json; charset=utf-8
Date: Thu, 06 Oct 2016 07:26:29 GMT
ETag: W/"41-cdfdfc9f"
X-Powered-By: Express

{
    "name": "myapi",
    "scope": "*",
    "user_id": "57f08e4f236bd8179cab2890"
}

---------------------------------------------
new user:

D:\FREELANCE\node.js\NodeAPI-master>http http://localhost:1337/api/users/register @newuser.json
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 364
Content-Type: application/json; charset=utf-8
Date: Thu, 06 Oct 2016 12:46:23 GMT
Vary: X-HTTP-Method-Override
X-Powered-By: Express

{
    "beginUser": {
        "__v": 0,
        "_id": "57f6479fcb106e01ecd2ab58",
        "created": "2016-10-06T12:46:23.319Z",
        "email": "ivan@mail.com",
        "firstName": "Ivan",
        "friends": [],
        "hashedPassword": "5dd3292766c44a74c6b4c7c8954645f530384da1",
        "lastName": "Ivanov",
        "phoneNumber": "89881002201",
        "salt": "76e963c05c94d293eb08dc38af28c6e82781aa0e19d2a71e7424904716f902ec",
        "username": "user1"
    },
    "status": "OK"
}

---------------------------------------------
Все друзья заданного пользователя:

D:\FREELANCE\node.js\NodeAPI-master>http  http://localhost:1337/api/users/friends/57f6479fcb106e01ecd2ab58 Authorization:"Bearer 4811f0cd14db25a20c8c887d9457e148b51aaa639cd7296a485f910d9e929d68"
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 287
Content-Type: application/json; charset=utf-8
Date: Fri, 07 Oct 2016 07:29:28 GMT
ETag: W/"11f-42b5137a"
X-Powered-By: Express

[
    {
        "firstName": "Petr",
        "friendshipDuration": "2016-10-06T16:48:22.344Z",
        "friendshipType": "5",
        "id": "57f64850cb106e01ecd2ab59",
        "lastName": "Petrov"
    },
    {
        "firstName": "Roman",
        "friendshipDuration": "2016-10-06T16:47:59.955Z",
        "friendshipType": "5",
        "id": "57f64a4dcb106e01ecd2ab5d",
        "lastName": "Romanov"
    }
]

---------------------------------------------
Удаление токенов текущего пользователя:

D:\FREELANCE\node.js\NodeAPI-master>http http://localhost:1337/api/users/delltokens Authorization:"Bearer c387f6751affb840b0232f431915333e0a1658c4d726f3936317a95fbb27a67c"
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Connection: keep-alive
Content-Length: 99
Content-Type: application/json; charset=utf-8
Date: Fri, 07 Oct 2016 12:23:44 GMT
ETag: W/"63-e8d7441c"
X-Powered-By: Express

{
    "description": "Removed access/refresh tokens for user id: 57f6479fcb106e01ecd2ab58",
    "status": "OK"
}
