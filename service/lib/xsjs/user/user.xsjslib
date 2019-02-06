var user = function (connection) {

    const USER_TABLE = "SAM::User";
    /*
            const USER = $.session.securityContext.userInfo.familyName ?
                $.session.securityContext.userInfo.familyName + " " + $.session.securityContext.userInfo.givenName :
                $.session.getUsername().toLocaleLowerCase(),
    */

    this.doGet = function (obj) { //?????
        const result = connection.executeQuery('SELECT * FROM "SAM::User"');

      //  result.forEach(x => $.trace.error(JSON.stringify(x)));

        $.response.status = $.net.http.OK;
        $.response.setBody(JSON.stringify(result));
    };


    this.doPost = function (oUser) {

        $.trace.error("oUser:   "+JSON.stringify(oUser));
        //Get Next ID Number
        oUser.usid = getNextval("SAM::usid");

        //generate query
        const statement = createPreparedInsertStatement(USER_TABLE, oUser);
        //execute update
        connection.executeUpdate(statement.sql, statement.aValues);

        connection.commit();
        $.response.status = $.net.http.CREATED;
        $.response.setBody(JSON.stringify(oUser));
    };


    this.doPut = function (oUser) {
        //generate query
         let oResult = {
            aParams: [],
            aValues: [],
            sql: "",
        };

        oResult.sql = `UPDATE "${USER_TABLE}" SET "name"='${oUser.name}' WHERE "usid"=${oUser.usid};`;

        $.trace.error("sql to update: " + oResult.sql);
       // const statement = createPreparedUpdateStatement(USER_TABLE, oUser);
        //execute update
        connection.executeUpdate(oResult.sql, oResult.aValues);

        connection.commit();
        $.response.status = $.net.http.OK;
        $.response.setBody(JSON.stringify(oUser));
    };


    this.doDelete = function (usid) {
        const statement = createPreparedDeleteStatement(USER_TABLE, {usid: usid});
        connection.executeUpdate(statement.sql, statement.aValues);

        connection.commit();
        $.response.status = $.net.http.OK;
        $.response.setBody(JSON.stringify({}));
    };


    function getNextval(sSeqName) {
        const statement = `select "${sSeqName}".NEXTVAL as "ID" from dummy`;
       
        const result = connection.executeQuery(statement);

        if (result.length > 0) {
            $.trace.error("ID: "+result[0].ID);
            return result[0].ID;
        } else {
            throw new Error('ID was not generated');
        }
    }

    
    function createPreparedInsertStatement(sTableName, oValueObject) {
        let oResult = {
            aParams: [],
            aValues: [],
            sql: "",
        };

        let sColumnList = '', sValueList = '';

        Object.keys(oValueObject).forEach(value => {
            sColumnList += `"${value}",`;
            oResult.aParams.push(value);
        });

        Object.values(oValueObject).forEach(value => {
            sValueList += "?, ";
            oResult.aValues.push(value);
        });

        $.trace.error("svalue " + sValueList);
        $.trace.error("scolumn: " + sColumnList);

        // Remove the last unnecessary comma and blank
        sColumnList = sColumnList.slice(0, -1);
        sValueList = sValueList.slice(0, -2);

        oResult.sql = `insert into "${sTableName}" (${sColumnList}) values (${sValueList})`;

        $.trace.error("sql to insert: " + oResult.sql);
        return oResult;
    };

    function createPreparedUpdateStatement(sTableName, oValueObject) {
        let oResult = {
            aParams: [],
            aValues: [],
            sql: "",
        };

        let sColumnList = '', sValueList = '';

        Object.keys(oValueObject).forEach(value => {
            sColumnList += `"${value}",`;
            oResult.aParams.push(value);
        });

        Object.values(oValueObject).forEach(value => {
            sValueList += "?, ";
            oResult.aValues.push(value);
        });

        $.trace.error("svalue " + sValueList);
        $.trace.error("scolumn: " + sColumnList);

        // Remove the last unnecessary comma and blank
        sColumnList = sColumnList.slice(0, -1);
        sValueList = sValueList.slice(0, -2);

        oResult.sql = `UPDATE "${sTableName}" SET "name"='${sValueList}' WHERE "usid"=002;  values ()`;

        $.trace.error("sql to insert: " + oResult.sql);
        return oResult;
    };

    function createPreparedDeleteStatement(sTableName, oConditionObject) {
        let oResult = {
            aParams: [],
            aValues: [],
            sql: "",
        };

        let sWhereClause = '';
        var name, value, condIndex, condition;
        oConditionObject.forEach((value, key) => {
            whereClause += `"${key}"=? and `;
            oResult.aValues.push(value);
            oResult.aParams.push(key);
        });
        // Remove the last unnecessary AND
        sWhereClause = sWhereClause.slice(0, -5);
        if (sWhereClause.length > 0) {
            sWhereClause = " where " + sWhereClause;
        }

        oResult.sql = `delete from "${sTableName}" ${sWhereClause}`;

        $.trace.error("sql to delete: " + oResult.sql);
        return oResult;
    };
};
