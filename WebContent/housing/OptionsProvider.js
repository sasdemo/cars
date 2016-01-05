/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

define([ "dojo/_base/declare",
        "retail/OptionsProvider",
        "dojo/json",
        "dojox/string/sprintf",
], function(declare, Provider, JSON, sprintf) {
  return declare("retail.housing.OptionsProvider", [Provider], {

    getOptions : function(callback, errorCallback){

      var me = this;

      dojo.xhrGet({
        url : 'housing?'+this.args.query,//'https://www.hudhomestore.com/pages/ListExportToExcel.aspx?zipCode=&city=&county=&sState=PA&fromPrice=0&toPrice=0&fCaseNumber=&bed=0&bath=0&street=&buyerType=0&specialProgram=&Status=0',
        handleAs : "text",
        load : function(txt){
            console.log("housingOptionsProvider load");
            console.log("this.args.query", me.args.query);
            //console.log("response", txt);

            var parsed = JSON.parse(txt, true);

            //console.log("JSON", parsed);

            txt = me.createTable(parsed);


            var node = dojo.create('div');
            dojo.style(node, "display", "none");
            node.innerHTML = txt;

            var trs = dojo.query('tr', node);

            var tr0 = trs[0];
            var ths = dojo.query('th', tr0);
            var cols = ths.map(function(th){return th.textContent.replace(/\s/g, '_')});

            var ops = [];
            for(var i =1; i< trs.length; i++){
                var op ={};
                var tds = dojo.query('td', trs[i]);
                cols.forEach(function(col, j){
                  op[col] = tds[j].textContent;
                });
                //op.image = 'https://www.hudhomestore.com/pages/ImageShow.aspx?Case=' + op['Property_Case'];
                op.image = parsed[i-1].photos[0];
                //TODO fix or remove
                op.url = 'http://www.hudhomestore.com/Listing/PropertyDetails.aspx?caseNumber='+ op['Property_Case'];
                ops.push(op);
            }
            dojo.destroy(node);
            callback(ops);
        },
        error : errorCallback
      });
    },
      createTable: function(parsed){
        var result = '<table border="1">',
            me = this;

        result += this._addHeader();
        parsed.forEach(function(item){
            result += me._addRow(item);
        });
        result += '</table>';

        return result;
    },
    _addHeader: function(){
        // listingId address.full address.city address.state address.postalCode address.country listPrice property.bedrooms property.bathsFull property.area property.yearBuilt leaseType listDate sales.contractDate mls.daysOnMarket mls.status
        return '<tr><th>Property Case</th><th>Address</th><th>City</th><th>State</th><th>Zip Code</th><th>County</th><th>Price</th><th>Bed</th><th>Bath</th><th>Square Footage</th><th>Year Built</th><th>FHA Financing</th><th>List Date</th><th>Bid Open Date</th><th>Listing Period</th><th>Status</th> </tr>';
    },
    _addRow: function(data){
        return sprintf('<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                    data.listingId, data.address.full, data.address.city, data.address.state, data.address.postalCode, data.address.country, data.listPrice, data.property.bedrooms,
                    data.property.bathsFull, data.property.area, data.property.yearBuilt, data.leaseType, data.listDate ? data.listDate.split('T')[0] : 'N/A', data.sales.contractDate ? data.sales.contractDate.split('T')[0] : 'N/A', data.mls.daysOnMarket, data.mls.status);
    }


  })
});