Go and fix this error, do not remove or modify any other code not related to this error: ERROR SyntaxError: /home/jobel/projects/app-project/app/screens/dashboard/NotificationsScreen.tsx: Identifier 'NotificationItem' has already been declared. (377:6)

375 | };
376 |

> 377 | const NotificationItem: React.FC<{

      |       ^

378 | notification: Notification;
379 | onMarkAsRead: (id: string) => void;
380 | }> = ({ notification, onMarkAsRead }) => {
at constructor (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:365:19)
at TypeScriptParserMixin.raise (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:6599:19)
at TypeScriptScopeHandler.checkRedeclarationInScope (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:1619:19)
at TypeScriptScopeHandler.declareName (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:1585:12)
at TypeScriptScopeHandler.declareName (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:4880:11)
at TypeScriptParserMixin.declareNameFromIdentifier (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:7567:16)
at TypeScriptParserMixin.checkIdentifier (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:7563:12)
at TypeScriptParserMixin.checkLVal (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:7500:12)
at TypeScriptParserMixin.parseVarId (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:13402:10)
at TypeScriptParserMixin.parseVarId (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:9742:11)
at TypeScriptParserMixin.parseVar (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:13373:12)
at TypeScriptParserMixin.parseVarStatement (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:13220:10)
at TypeScriptParserMixin.parseVarStatement (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:9408:31)
at TypeScriptParserMixin.parseStatementContent (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:12841:23)
at TypeScriptParserMixin.parseStatementContent (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:9508:18)
at TypeScriptParserMixin.parseStatementLike (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:12757:17)
at TypeScriptParserMixin.parseModuleItem (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:12734:17)
at TypeScriptParserMixin.parseBlockOrModuleBlockBody (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:13306:36)
at TypeScriptParserMixin.parseBlockBody (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:13299:10)
at TypeScriptParserMixin.parseProgram (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:12612:10)
at TypeScriptParserMixin.parseTopLevel (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:12602:25)
at TypeScriptParserMixin.parse (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:14478:25)
at TypeScriptParserMixin.parse (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:10116:18)
at parse (/home/jobel/projects/app-project/node_modules/@babel/parser/lib/index.js:14491:26)
at parser (/home/jobel/projects/app-project/node_modules/@babel/core/lib/parser/index.js:41:34)
at parser.next (<anonymous>)
at normalizeFile (/home/jobel/projects/app-project/node_modules/@babel/core/lib/transformation/normalize-file.js:64:37)
at normalizeFile.next (<anonymous>)
at run (/home/jobel/projects/app-project/node_modules/@babel/core/lib/transformation/index.js:22:50)
at run.next (<anonymous>)
at transform (/home/jobel/projects/app-project/node_modules/@babel/core/lib/transform.js:22:33)
at transform.next (<anonymous>)
at evaluateSync (/home/jobel/projects/app-project/node_modules/gensync/index.js:251:28)
at sync (/home/jobel/projects/app-project/node_modules/gensync/index.js:89:14)
at stopHiding - secret - don't use this - v1 (/home/jobel/projects/app-project/node_modules/@babel/core/lib/errors/rewrite-stack-trace.js:47:12)
at Object.transformSync (/home/jobel/projects/app-project/node_modules/@babel/core/lib/transform.js:40:76)
at parseWithBabel (/home/jobel/projects/app-project/node_modules/@expo/metro-config/build/transformSync.js:75:18)
at transformSync (/home/jobel/projects/app-project/node_modules/@expo/metro-config/build/transformSync.js:54:16)
at Object.transform (/home/jobel/projects/app-project/node_modules/@expo/metro-config/build/babel-transformer.js:127:58)
at transformJSWithBabel (/home/jobel/projects/app-project/node_modules/@expo/metro-config/build/transform-worker/metro-transform-worker.js:468:47)
