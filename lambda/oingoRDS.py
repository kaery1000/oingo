import pymysql
import sys
import json

REGION = 'us-east-1'
rds_host = ""
name = ""
password = ""
db_name = ""


def main(event, context):
    if 'triggerSource' in event and event['triggerSource'] == 'PostConfirmation_ConfirmSignUp':
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        details = event['request']['userAttributes']
        with conn.cursor() as cur:
            cur.execute("""insert into user(uID, uName, uEmail, uPhone) values ("%s", "%s", "%s", "%s")""" % (details['sub'], details['name'], details['email'], details['phone_number']))
            conn.commit()
            cur.close()

        conn.close()
        return event

    #################################   NOTES   #################################

    if 'action' in event and event['action'] == 'addNote':
        uID = event['uID']
        nTitle = event['nTitle']
        nDesc = event['nDesc']
        nLat = event['nLat']
        nLong = event['nLong']
        nRadius = event['nRadius']
        nVisible = event['nVisible']
        nDay = event['day']
        nFreq = event['frequency']
        nTag = event['nTag']
        startTime = event['startTime']
        endTime = event['endTime']

        conn = pymysql.connect(rds_host, user=name,
                               passwd=password, db=db_name, connect_timeout=5)
        with conn.cursor() as cur:
            #cur.execute("""call createNote("%s", "%s", "%s", %s, %s, %s, %s,%s,"%s", "%s", "%s", "%s" )""" % (uID, nTitle, nDesc, nLong, nLat, nRadius, startTime, endTime, nDay, nFreq, nVisible, nTag))
            sql = 'call createNote(%s, %s, %s, %s, %s, %s, %s,%s,%s, %s, %s, %s )'
            data = (uID, nTitle, nDesc, nLong, nLat, nRadius, startTime, endTime, nDay, nFreq, nVisible, nTag)
            cur.execute(sql, data)
            conn.commit()
            cur.close()

        conn.close()
        return {"statusCode": 200, "body": "Note Inserted Successfully!"}

    if 'retrieve' in event and event['retrieve'] == 'getPersonalNotes':
        uID = event['uID']
        notes = []
        conn = pymysql.connect(rds_host, user=name,
                               passwd=password, db=db_name, connect_timeout=5)
        with conn.cursor() as cur:
            sql ='select nTitle, nDesc, createdAt, nTags from note natural left join note_schedule natural left join note_location natural left join note_tags where note.uid=%s'
            #cur.execute(""" select nTitle, nDesc, createdAt, nTags from note natural left join note_schedule natural left join note_location natural left join note_tags where note.uid="%s" """ % (uID))
            data = (uID)
            cur.execute(sql, data)
            conn.commit()
            cur.close()
        conn.close()

        result = list(cur)
        print(result)
        if len(result) > 0:
            for row in result:
                notes.append([row[-1], row[0], row[1], row[2].__str__()])

        return {"statusCode": 200, "body": notes}

    if 'retrieve' in event and event['retrieve'] == 'getCurrentNotes':
        uID = event['uID']
        uLat = event['uLat']
        uLong = event['uLong']
        uState = event['uState']

        notes = []
        conn = pymysql.connect(rds_host, user=name,
                               passwd=password, db=db_name, connect_timeout=5)
        with conn.cursor() as cur:
            sql = 'call getNotes(%s, %s, %s, %s)'
            #cur.execute(""" call getNotes("%s", %s, %s, "%s") """ %
                        #(uID, uLong, uLat, uState))
            data = (uID, uLong, uLat, uState)
            cur.execute(sql, data)
            conn.commit()
            cur.close()
        conn.close()

        result = list(cur)
        print(result)
        if len(result) > 0:
            for row in result:
                notes.append(
                    [row[1], row[2], row[4].__str__(), row[5], row[3]])

        return {"statusCode": 200, "body": notes}

    #################################   FRIENDS   #################################

    if 'action' in event and event['action'] == 'sendFriendRequest':
        uID = event['uID']
        email = event['friendEmail']

        setMsg = False
        conn = pymysql.connect(rds_host, user=name,
                               passwd=password, db=db_name, connect_timeout=5)
        with conn.cursor() as cur:
            #cur.execute("""select uid from user where uEmail="%s" """ % (email))
            sql ='select uid from user where uEmail=%s'
            data = (email)
            cur.execute(sql,data)
            
            user = list(cur)
            cur.execute("""select checkFriendship("%s", "%s")""" %(uID, user[0][0]))

            checkFriends = list(cur)
            if checkFriends[0][0] != 1:
                if len(user) > 0:
                    sql1='insert into friend_requests (From_uID, To_uID) values (%s, %s)'
                    data2=(uID, user[0][0])
                    #cur.execute(""" insert into friend_requests (From_uID, To_uID) values ("%s", "%s") """ % (uID, user[0][0]))
                    cur.execute(sql1,data2)
                    setMsg = True
            else:
                pass
            conn.commit()
            cur.close()

        conn.close()
        if len(user) < 0:
            return {"statusCode": 200, "body": setMsg}
        else:
             return {"statusCode": 200, "body": setMsg}

    if 'action' in event and event['action'] == 'acceptFriendRequest':
        uID = event['uID']
        friendID = event['friendID']

        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        with conn.cursor() as cur:
            #cur.execute("""insert into user_friends(userID, userFriendID) values("%s", "%s") """ % (uID, friendID))
            #cur.execute("""delete from friend_requests where From_uID="%s" and To_uID="%s" """ % (friendID, uID))
            
            sql1 = 'insert into user_friends(userID, userFriendID) values(%s, %s)'
            sql2 = 'delete from friend_requests where From_uID=%s and To_uID=%s'
            data1 = (uID, friendID)
            data2 = (friendID, uID)
            
            cur.execute(sql1,data1)
            cur.execute(sql2, data2)
            conn.commit()
            cur.close()

        conn.close()
        return {"statusCode": 200, "body": "Friend request accepted"}

    if 'retrieve' in event and event['retrieve'] == 'getPendingRequests':
        uID = event['uID']
        request = []
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        
        with conn.cursor() as cur:
            cur.execute("""select * from user where uid in (select distinct From_uID from friend_requests where To_uID="%s") """ % (uID))
            user = list(cur)
            if len(user) > 0:
                for i in user:
                    request.append(list(i))
            conn.commit()
            cur.close()

        conn.close()
        if len(request) > 0:
            return {"statusCode": 200, "body": request}
        else:
             return {"statusCode": 200, "body": "No pending requests"}

    if 'retrieve' in event and event['retrieve'] == 'getFriends':
        uID = event['uID']
        friends = []
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)

        with conn.cursor() as cur:
            cur.execute(""" select * from user where uid in (( select uf.userFriendID from user_friends uf where uf.userID = "%s") union ( select uf2.userID from user_friends uf2 where uf2.userFriendID = "%s"))""" % (uID, uID))
            arr = list(cur)
            if len(arr) > 0:
                for i in arr:
                    friends.append(list(i))
            conn.commit()
            cur.close()

        conn.close()
        if len(friends) > 0:
            return {"statusCode": 200, "body": friends}
        else:
            return {"statusCode": 200, "body": "No friends found"}

    #################################   USER   #################################

    if 'retrieve' in event and event['retrieve'] == 'getUser':
        uID = event['uID']
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        
        with conn.cursor() as cur:
            cur.execute("""select * from user where uID="%s" """ % (uID))
            conn.commit()
            cur.close()
        conn.close()

        user = list(cur)[0]
        d = {"name": user[1], "email": user[2], "phone_number": user[3],
             "FirstName": user[4], "LastName": user[5]}
        return {"statusCode": 200, "body": d}

    if 'update' in event and event['update'] == 'updateUser':
        uID = event['uID']
        FirstName = event['FirstName']
        LastName = event['LastName']
        phone_number = event['phone_number']

        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        
        with conn.cursor() as cur:
            #cur.execute("""update user set FirstName="%s", LastName="%s", uPhone="%s" where uID="%s" """ % (FirstName, LastName, phone_number, uID))
            sql = 'update user set FirstName=%s, LastName=%s, uPhone=%s where uID=%s '
            data = (FirstName, LastName, phone_number, uID)
            cur.execute(sql,data)
            
            conn.commit()
            cur.close()
        conn.close()

        return {"statusCode": 200, "body": "User Updated Successfully!"}

    #################################   Filters   #################################

    if 'action' in event and event['action'] == 'addFilter':
        uID = event['uID']
        notesFrom = event['fVisible']
        uState = event['uState']
        fLong = str(event['fLong'])
        fLat = str(event['fLat'])
        fRadius = event['fRadius']
        startTime = event['startTime']
        endTime = event['endTime']
        fOnDay = event['day']
        tags = event['nTag']

        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        
        with conn.cursor() as cur:
            #cur.execute(""" call add_filter("%s", "%s", "%s", %s, %s, %s, %s, %s, "%s","%s" )""" % (uID, notesFrom, uState.lower(), fLong[:7], fLat[:7], fRadius, startTime, endTime, fOnDay, tags))
            sql = 'call add_filter(%s, %s, %s, %s, %s, %s, %s, %s, %s,%s )'
            data = (uID, notesFrom, uState.lower(), fLong[:10], fLat[:10], fRadius, startTime, endTime, fOnDay, tags)
            cur.execute(sql,data)
            
            conn.commit()
            cur.close()

        conn.close()
        return {"statusCode": 200, "body": True}

    if 'retrieve' in event and event['retrieve'] == 'getFilters':
        uID = event['uID']
        filter = []
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        
        with conn.cursor() as cur:
            cur.execute(
                """ select * from filter f natural left join filter_location fl  natural left join filter_Schedule fs where f.uid = "%s" """ % (uID))
            result = list(cur)
            if len(result) > 0:
                for i in result:
                    filter.append(list(i))
            conn.commit()
            cur.close()
        conn.close()

        if(filter == []):
            return {"statusCode": 200, "body": "No filters set yet"}
        else:
            return {"statusCode": 200, "body": filter}

    #################################   STATE   #################################

    if 'action' in event and event['action'] == 'addState':
        print(event)
        uID = event['uID']
        state = event['userState']

        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        with conn.cursor() as cur:
            sql = ' UPDATE user_status SET uState = %s WHERE uid = %s '
            data = (state, uID)
            cur.execute(sql,data)
            #cur.execute(""" UPDATE user_status SET uState = "%s" WHERE uid = "%s" """ % (state, uID))
            #cur.executemany(sql, data)
            conn.commit()
            cur.close()

        conn.close()

        return {"statusCode": 200, "body": "state updated successfully"}

    if 'retrieve' in event and event['retrieve'] == 'getState':
        uID = event['uID']

        hasState = False
        conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
        with conn.cursor() as cur:
            cur.execute(
                """ select uState from user_status where uid="%s" """ % (uID))
            conn.commit()
            cur.close()

        arr = list(cur)
        conn.close()
        print(arr)
        if len(arr) > 0:
            hasState = arr[0][0]
        else:
            pass
        return {"statusCode": 200, "body": hasState}

    #################################   GENERAL   #################################

    conn = pymysql.connect(rds_host, user=name,
                           passwd=password, db=db_name, connect_timeout=5)
    with conn.cursor() as cur:
        cur.execute("""  select * from user""")
        conn.commit()
        cur.close()

    for row in cur:
        print('\n', list(row), '\n')

    conn.close()