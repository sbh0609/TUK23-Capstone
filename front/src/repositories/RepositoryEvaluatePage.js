// import React, { Fragment, useState, useEffect } from "react";
// import "./RepositoryEvaluatePage.css";
// import { useRepository } from '../Context/RepositoryContext'; // Context를 가져옵니다.
// import axios from 'axios';

// const RepositoryEvaluatePage = () =>{
//     const session_userID = sessionStorage.getItem("userID")
//     const { repositoryDetail } = useRepository();
//     const { repo_name, fileList, username, repo_type, click_time } = repositoryDetail;
//     const [repoAnalyze, setRepoAnalyze] = useState(null);
//     const [evaluate, setEvaluate] = useState(null);
//     const [open, setOpen] = useState(false);
//     const [selectedCard, setSelectedCard] = useState(null);
//     const [modalData, setModalData] = useState(null);

//     useEffect(() => {

//         axios.post('http://localhost:5000/api/analyze', { repo_name, username, fileList, repo_type, click_time, session_userID })
//           .then(response => {
//             console.log(response);
//             setRepoAnalyze(response.data.repo_analyze);
//             setEvaluate(response.data.evaluate);
//           })
//           .catch(error => {
//             console.error('Error', error);
//             window.alert('Error: ' + error);
//           });
//     }, [repo_name, username, fileList, repo_type, click_time, session_userID]);
//     if (!repoAnalyze || !evaluate) {
//         return <div>Loading...</div>;
//     }
//     const languages = Object.entries(repoAnalyze.program_lang).map(([lang, percentage]) => ({ lang, percentage }));
//     const frameworks = repoAnalyze.framework;
//     const {
//         comment_score,
//         duplication_score,
//         complexity_file_scores,
//         complexity_repo_score,
//         function_length_file_scores,
//         function_length_repo_score,
//         parameter_count_file_scores,
//         parameter_count_repo_score,
//         commit_score,
//         pr_scores,
//         issue_scores,
//         commit_message_quality_scores,
//         commit_message_grammar_scores,
//         total_collaboration_score,
//         user_collaboration_score,
//         code_quality
//       } = evaluate;
//       console.log(evaluate)
//       const { comment_per, duplicate_code, total_quality, total_grammar, keyword_count } = repoAnalyze;
//       const totalLines = comment_per ? comment_per[0] : 0;
//       const commentLines = comment_per ? comment_per[1] : 0;
//       const commentRatio = comment_per ? comment_per[2] : 0;
    
//       const totalDuplicateLines = duplicate_code ? duplicate_code[0] : 0;
//       const duplicatedLines = duplicate_code ? duplicate_code[1] : 0;
//       const duplicationRatio = duplicate_code ? duplicate_code[2] : 0;

// }