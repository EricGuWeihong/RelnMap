public with sharing class AcctRelnController {
    @AuraEnabled
    public static List<OCE__Affiliation__c> getAffiliationList(Id accountId){
        try {
            // return [SELECT BEI_Source__c, BEI_Target__c, BEI_Type__c, BEI_Weight__c 
            //         FROM BEI_EdgeDetail__c
            //         WHERE BEI_Source__c = :accountId
            //         AND IsDeleted = False AND BEI_Target__c != null
            //         WITH SECURITY_ENFORCED
            //         ];
            return [
                SELECT BEI_Weight__c, OCE__From__c, OCE__From__r.Name, tolabel(OCE__From__r.OCE__Department__c), 
                    OCE__From__r.BEI_Relation__c, OCE__To__c, OCE__To__r.Name,
                    tolabel(OCE__To__r.OCE__Department__c), OCE__To__r.BEI_Relation__c,
                    BEI_RND_Weight__c, BEI_Same_Hospital__c
                FROM OCE__Affiliation__c 
                WHERE OCE__From__c = :accountId AND OCE__UniqueIntegrationID__c != null AND IsDeleted = False
                ORDER BY BEI_Weight__c DESC NULLS LAST
                LIMIT 30
            ];
        } catch (Exception e) {
            return null;
        }
    }
}