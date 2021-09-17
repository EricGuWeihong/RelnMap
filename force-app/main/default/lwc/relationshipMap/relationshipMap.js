import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import ECHARTS from '@salesforce/resourceUrl/JSlib';
import getAffiliationList from '@salesforce/apex/AcctRelnController.getAffiliationList';
// import getOthLinks from '@salesforce/apex/AcctRelnController.getOthLinks';
var categoryList = []
var nodes = []
var links = []

export default class helloWorld extends LightningElement {
  @api recordId;
  connectedCallback() {
  }
  initializeEcharts = false; //Variable to load check if echarts is initialize
  //renderedCallback Use it to perform logic after a component has finished the rendering phase
  renderedCallback() {
    console.log('renderedCallback' + this.initializeEcharts);
    if (this.initializeEcharts) {
      return;
    }
    
    this.initializeEcharts = true;
    nodes = [];
    links = [];
    categoryList = []
    getAffiliationList({accountId: this.recordId}).then(data => {
      // console.log('data.length => ', data.length, '<eof>')
      if( data.length !== 0 ) {
        console.log('connectedCallback => ' , this.recordId);
        let node = {};
        let categoryIndex = 0;
        let specialtyList = [];
        let link = [];
  
        data.forEach(affiliation =>{
          // kolList.push(affiliation.OCE__To__c)
          if(specialtyList.includes(affiliation.OCE__To__r.OCE__Department__c)){
              categoryIndex =  specialtyList.indexOf(affiliation.OCE__To__r.OCE__Department__c)
          } else {
              specialtyList.push(affiliation.OCE__To__r.OCE__Department__c)
              categoryList.push({
                  "name": affiliation.OCE__To__r.OCE__Department__c
              })
              categoryIndex =  specialtyList.indexOf(affiliation.OCE__To__r.OCE__Department__c)
          }
          node = {
              "id": affiliation.OCE__To__c,
              // "name": affiliation.OCE__To__r.Name +' ('+ affiliation.OCE__To__r.OCE__ParentAccount__r.Name + ')',
              "name": affiliation.OCE__To__r.Name,
              "symbolSize": affiliation.OCE__To__r.BEI_Relation__c,
              "value": affiliation.OCE__To__r.BEI_Relation__c,
              // "symbolSize": affiliation.BEI_Weight__c,
              // "value": affiliation.BEI_Weight__c,
              "category": categoryIndex
          }
          nodes.push(node)
          link = {
              "source": affiliation.OCE__From__c,
              "target": affiliation.OCE__To__c,
              "value": affiliation.BEI_Weight__c
                }
          links.push(link)
        })
      //   kolList.push(data[0].OCE__From__c)
        if(specialtyList.includes(data[0].OCE__From__r.OCE__Department__c)){
            categoryIndex =  specialtyList.indexOf(data[0].OCE__From__r.OCE__Department__c)
        } else {
            specialtyList.push(data[0].OCE__From__r.OCE__Department__c)
            categoryList.push({
                  "name": data[0].OCE__From__r.OCE__Department__c
            })
            categoryIndex =  specialtyList.indexOf(data[0].OCE__From__r.OCE__Department__c)
        }
        node = {
          "id": data[0].OCE__From__c,
          "name": data[0].OCE__From__r.Name,
          "symbolSize": data[0].OCE__From__r.BEI_Relation__c,
          // "value": data[0].BEI_Weight__c,
          "value": data[0].OCE__From__r.BEI_Relation__c,
          "category": categoryIndex
        }
        nodes.push(node);
        // console.log('renderedCallback3' + JSON.stringify(nodes));
        Promise.all([
          loadScript(this, ECHARTS + '/echarts.js')
      ])
          .then(() => {
              this.runEcharts();
          })
          .catch((error) => {
              this.error = error;
              this.dispatchEvent(
                  new ShowToastEvent({
                      title: 'Error loading ECHARTS',
                      message: this.error.message,
                      variant: 'error'
                  })
              )
          });
      }
    }).catch(error => {
      this.error = error;
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error getting affiliation list',
          message: this.error.message,
          variant: 'error'
        })
      )
      window.console.log('Error#'+ JSON.stringify(error));
    })
  }

  runEcharts() {
    console.log('runEcharts')
    var myChart = echarts.init(this.template.querySelector('div.main')); //to select the div to embed the chart

    var graph = {
        "nodes": nodes,
        "links": links,
        "categories": categoryList
    }

    console.log(' 🚀 ', graph);

    graph.nodes.forEach(function (node) {
        node.label = {
            show: node.symbolSize >10
        };
    });
    
      // specify chart configuration item and data
    var option = {
        title: {
            text: 'BeCE',
            subtext: 'BeiGene Customer Engagement',
            top: 'bottom',
            left: 'right'
        },
        tooltip: {},
        legend: [{
            // selectedMode: 'single',
            data: graph.categories.map(function (a) {
                return a.name;
            })
        }],
        animationDuration: 100,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: '影响力',
                type: 'graph',
                layout: 'force',
                data: graph.nodes,
                links: graph.links,
                categories: graph.categories,
                roam: true,
                label: {
                    position: 'bottom',
                    formatter: '{b}'
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 10
                    }
                },
                force: {
                    // gravity: 0.1,               //节点受到的向中心的引力因子。该值越大节点越往中心点靠拢
                    repulsion: 50,              //节点之间的斥力因子，值越大则斥力越大
                    layoutAnimation: true,     //关闭动画效果
                    edgeLength: [50, 150],       //边的两个节点之间的距离，值最大的边长度会趋向于 10，值最小的边长度会趋向于 50
                    friction: 0.1              //这个参数能减缓节点的移动速度。取值范围 0 到 1。
                },
                zoom: 1
            }
        ]
    };

    myChart.setOption(option);
  }
}