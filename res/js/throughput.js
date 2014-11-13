var app = angular.module("throughputApp", ['highcharts-ng']);
/*
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken`';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);
*/
app.controller("throughputController", function($scope, limitToFilter, $http, $log) {

	$scope.initialize = function() {

    $scope.baseURL = './proxy.php';

    $scope.filters = {
      from_date: '',
      to_date: '',
      imei: '',
      sdk_version: '',
      app_version: ''
    };
    $scope.pie_type = 'all';
    $scope.pie_items = [     
                        ['CONDUCTED', 0],
                        ['FAILED', 0],
                        ['RESTRICTED', 0]
                     ];
    $scope.loadedLists = 0;
		$scope.load();
	};

  $scope.change = function() {
    $scope.loadedLists = 0;
    $scope.load();    
  }
	
  /*
  * construct 3 lists [Conducted, Failed, Restricted] under filters 
  */
	$scope.load = function() {   
    
    var url = $scope.baseURL;
    url+='?';
    for (var key in $scope.filters) {
      if($scope.filters[key] !== '')
        if (key=='from_date' || key=="to_date") {
          var date = $scope.filters[key].split('-');
          if(date.length == 3){
            var new_date = date[0]+'/'+date[1]+'/'+date[2];
            url = url.concat(key, '=', new Date(new_date).getTime(), '&');
          }
        } else {
        url = url.concat(key, '=', $scope.filters[key], '&');
      }
    }
    
    console.log('base URL with filters  -->', url);
    var url_1 = url+'type=CONDUCTED';
    var url_2 = url+'type=FAILED';
    var url_3 = url+'type=RESTRICTED';

    $http.get(url_1).then(function(response){       // promise service			
        $scope.conductedThroughputs = response.data;
        console.log('conductedThroughputs --> ',$scope.conductedThroughputs);
        $scope.loadedLists++;
    });
    
    $http.get(url_2).then(function(response){       // promise service      
        $scope.failedThroughputs = response.data;
        console.log('failedThroughputs --> ',$scope.failedThroughputs);
        $scope.loadedLists++;

      });

    $http.get(url_3).then(function(response){       // promise service      
        $scope.restrictedThroughputs = response.data;
        console.log('restrictedThroughputs --> ',$scope.restrictedThroughputs);
        $scope.loadedLists++;

      }); 
	};
  
  $scope.update_pie_items = function() {
    
    $scope.pie_items = function() {
        switch($scope.pie_type) {
          case('all'):
            return [
                      ['CONDUCTED', $scope.conductedThroughputs.length],
                      ['RESTRICTED', $scope.restrictedThroughputs.length],
                      ['FAILED', $scope.failedThroughputs.length],
                   ];
          case('conducted'):
            return getSubTypePairArray($scope.conductedThroughputs);
                  
          case('failed'):
            return getSubTypePairArray($scope.failedThroughputs);
                   
          case('restricted'):
            return getSubTypePairArray($scope.restrictedThroughputs);
          default:
        }
      }();
  }


  $scope.swapChartType = function () {
        if (this.highchartsNG.options.chart.type === 'line') {
            this.highchartsNG.options.chart.type = 'bar'
        } else {
            this.highchartsNG.options.chart.type = 'line'
        }
  }

  /*
   * When finish loading, update Pie Chart and Line chart 
   */
  $scope.$watch('loadedLists', function(newVal){

      if($scope.loadedLists==3) {
       // $scope.throughputs = $scope.conductedThroughputs.concat($scope.failedThroughputs, $scope.restrictedThroughputs);
        //console.log('ALL THROUGHPUTS -->', $scope.throughputs);
        $scope.update_pie_items();
        var restrictedSeriesData = getDailyArray($scope.restrictedThroughputs);
        var failedSeriesData = getDailyArray($scope.failedThroughputs);
        var conductedSeriesData = getDailyArray($scope.conductedThroughputs);
        $scope.highchartsNG.series = [{data: conductedSeriesData, name: 'CONDUCTED'}, {data:restrictedSeriesData, name: 'RESTRICTED'} , {data: failedSeriesData, name: 'FAILED'}, {data: getTotalDailyArray(restrictedSeriesData, conductedSeriesData, failedSeriesData), name: 'TOTAL'}];
      }
  }, true);

  $scope.$watch('pie_type', function(newVal){
    
    if($scope.loadedLists==3) {
       $scope.update_pie_items();
    };
  }, true);

    $scope.highchartsNG = {
        options: {
            chart: {
                type: 'line'
            }
        },
        title: {
            text: 'Daily Throughput tests',
            x: -20 //center
        },
        subtitle: {
            text: '',
            x: -20
        },
        xAxis: {
            type: 'datetime',
            //tickInterval: 1,
            title: {
                text: '2014'
            },
            //categories: ['11-Nov', '12-Nov', '13-Nov', '14-Nov', '15-Nov', '16-Nov',
              //  '17-Nov']
        },
        yAxis: {
            title: {
                text: 'Number of Tests'
            },
            min: 0,
        },
        legend: {
                align: 'left',
                verticalAlign: 'top',
                y: 20,
                floating: true,
                borderWidth: 0
        },
        
        series: [],
        loading: false
    };

// Load the fonts
Highcharts.createElement('link', {
   href: 'http://fonts.googleapis.com/css?family=Unica+One',
   rel: 'stylesheet',
   type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);

Highcharts.theme = {
   colors: ["#93bd41", "#FFCC00", "#E95850", "#FFFFFF"],    // 0066FF blue   , F78D1F orange
   chart: {
      backgroundColor: {
         linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
         stops: [
            [0, '#2a2a2b'],
            [1, '#3e3e40']
         ]
      },
      style: {
        // fontFamily: "'Unica One', sans-serif"
      },
      plotBorderColor: '#606063'
   },
   title: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
         fontSize: '22px'
      }
   },
   subtitle: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase'
      }
   },
   xAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3',
            fontSize: '15px'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      title: {
         style: {
            color: '#A0A0A3',
            fontSize: '17px'
         }
      }
   },
   yAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3',
            fontSize: '15px'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      title: {
         style: {
            color: '#A0A0A3',
            fontSize: '17px'
         }
      }
   },
   tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      style: {
         color: '#F0F0F0',
         fontSize: '13px'
      }
   },
   plotOptions: {
      series: {
         dataLabels: {
            color: '#B0B0B3'
         },
         marker: {
            lineColor: '#333'
         }
      },
      boxplot: {
         fillColor: '#505053'
      },
      candlestick: {
         lineColor: 'black'
      },
      errorbar: {
         color: 'white'
      }
   },
   legend: {
      itemStyle: {
         color: '#E0E0E3'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#606063'
      }
   },
   credits: {
      style: {
         color: '#666'
      }
   },
   labels: {
      style: {
         color: '#707073'
      }
   },

   drilldown: {
      activeAxisLabelStyle: {
         color: '#F0F0F3'
      },
      activeDataLabelStyle: {
         color: '#F0F0F3'
      }
   },

   navigation: {
      buttonOptions: {
         symbolStroke: '#DDDDDD',
         theme: {
            fill: '#505053'
         }
      }
   },

   // scroll charts
   rangeSelector: {
      buttonTheme: {
         fill: '#505053',
         stroke: '#000000',
         style: {
            color: '#CCC'
         },
         states: {
            hover: {
               fill: '#707073',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            },
            select: {
               fill: '#000003',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            }
         }
      },
      inputBoxBorderColor: '#505053',
      inputStyle: {
         backgroundColor: '#333',
         color: 'silver'
      },
      labelStyle: {
         color: 'silver'
      }
   },

   navigator: {
      handles: {
         backgroundColor: '#666',
         borderColor: '#AAA'
      },
      outlineColor: '#CCC',
      maskFill: 'rgba(255,255,255,0.1)',
      series: {
         color: '#7798BF',
         lineColor: '#A6C7ED'
      },
      xAxis: {
         gridLineColor: '#505053'
      }
   },

   scrollbar: {
      barBackgroundColor: '#808083',
      barBorderColor: '#808083',
      buttonArrowColor: '#CCC',
      buttonBackgroundColor: '#606063',
      buttonBorderColor: '#606063',
      rifleColor: '#FFF',
      trackBackgroundColor: '#404043',
      trackBorderColor: '#404043'
   },

   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: '#505053',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)'
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);
  
});

//pie chart

app.directive('hcPie', function () {
  return {
    restrict: 'C',
    replace: true,
    scope: {
      items: '='
    },
    controller: function ($scope, $element, $attrs) {
     // console.log(2);

    },
    template: '<div id="container" style="margin: 0 auto">not working</div>',
    link: function (scope, element, attrs) {
      //console.log(attrs);
      var chart = new Highcharts.Chart({
        chart: {
          renderTo: 'container',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'Type / Subtype distribution'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              color: '#000000',
              connectorColor: '#00000',
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'percentage',
          data: scope.items
        }]
      });
      scope.$watch("items", function (newValue) {
        //console.log('newValue', newValue);
        chart.series[0].setData(newValue, true);
      }, true);
      
    }
  }

});

var getSubTypePairArray = function(throughputsList) {
    var subTypeList = [];
    var numberList = [];
    var pairList =[];
    for (i=0; i<throughputsList.length; i++) {
        if (subTypeList.indexOf(throughputsList[i].sub_type) == -1) {  // a new sub type
            subTypeList.push(throughputsList[i].sub_type);
            numberList.push(1);
        } else {
          numberList[subTypeList.indexOf(throughputsList[i].sub_type)]++;
        }
      }
    for (j=0; j<subTypeList.length; j++) {
      if (subTypeList[j]=='' || subTypeList[j]==null) 
        subTypeList[j] = 'unspecified';
      pairList[j] = [subTypeList[j], numberList[j]];
    }
    console.log('subtype - number list', pairList);
    return pairList;
}

var getDailyArray = function(throughputsList) {
  
  var dateNumList = [//[Date.UTC(2014, 10, 4), 0],
                  //[Date.UTC(2014, 10, 5), 0],
                  [Date.UTC(2014, 10, 6), 0],
                  [Date.UTC(2014, 10, 7), 0],
                  [Date.UTC(2014, 10, 8), 0],
                  [Date.UTC(2014, 10, 9), 0],
                  [Date.UTC(2014, 10, 10), 0],
                  [Date.UTC(2014, 10, 11), 0],
                  [Date.UTC(2014, 10, 12), 0],
                  [Date.UTC(2014, 10, 13), 0],
                  [Date.UTC(2014, 10, 14), 0],
                  //[Date.UTC(2014, 10, 15), 0]
                  ];   // last date not show in chart
  for (i=0; i<dateNumList.length-1; i++) {
    for (j=0; j<throughputsList.length; j++) {
        if (throughputsList[j].date >= dateNumList[i][0] && throughputsList[j].date < dateNumList[i+1][0]) {
            dateNumList[i][1]++; 
        }
      }
    }
  //dateNumList[dateNumList.length-1] = null;
  return dateNumList;
}

var getTotalDailyArray = function(a1, a2, a3) {
  var total = [];
  for (i=0; i<a1.length; i++) {
    total[i] = [];
    total[i][0] = a1[i][0];
    total[i][1] = a1[i][1] + a2[i][1] +a3[i][1];
  }
  return total;
}

$('.date').datetimepicker({
          //language:  'en',
            linkFormat: 'yyyy-mm-dd',
          weekStart: 1,
          todayBtn:  1,
      autoclose: 1,
      todayHighlight: 1,
      startView: 2,
      forceParse: 0,
          showMeridian: 0,
          //pickTime: false,
          //pickerPosition: 'top-right'
      });     
