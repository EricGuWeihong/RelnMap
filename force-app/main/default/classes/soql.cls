SELECT BEI_Weight__c, OCE__From__c,OCE__From__r.Name, tolabel(OCE__From__r.OCE__Department__c), OCE__From__r.BEI_Relation__c, OCE__From__r.OCE__ParentAccount__r.Name,
    OCE__To__c, OCE__To__r.Name, tolabel(OCE__To__r.OCE__Department__c), OCE__To__r.BEI_Relation__c, OCE__To__r.OCE__ParentAccount__r.Name
    FROM OCE__Affiliation__c 
    WHERE OCE__From__c = '0015h000005i5e5AAA' AND OCE__UniqueIntegrationID__c != null AND IsDeleted = False
    ORDER BY BEI_Weight__c DESC NULLS LAST
    LIMIT 10

    SELECT Entity.Name, Count(TopicId)
    FROM TopicAssignment
    WHERE EntityType = 'Account' AND Topic.Name IN (
        '医生圈子-Top5',
        '学术影响力-国家级',
        '恒瑞-Top50',
        '百济-Top50'
    )
    GROUP BY Entity.Name

SELECT Name, OCE__ParentAccount__r.Name, OCE__Department__c
FROM Account
WHERE Id in (
    SELECT EntityId
    FROM TopicAssignment
    WHERE EntityType = 'Account' AND Topic.Name IN (
        '医生圈子-Top5',
        '学术影响力-国家级',
        '恒瑞-Top50',
        '百济-Top50'
    )
    GROUP BY EntityId
    HAVING Count(TopicId) > 2
)