import React, { Component } from 'react';
import './styles/main.scss';
import Question from './Question.js';
import Message from './Message.js';
import QuizSummary from './QuizSummary.js';
import Welcome from './Welcome.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
        category: '',
        questions: [],
        userStatus: '',
        userResult: '',
        quizQuestionsIds: [],
        quizQuestionsIndex: 0,
        currentQuestionId: '',
        correctCounter: 0
    }
  }

  componentDidMount() {
    document.body.classList.add('background-color');
    fetch('https://memoize-datasets.herokuapp.com/api/v1/fundamentalsQuestions')
      .then(data => data.json())
      .then((results) => {
        results.fundamentalsQuestions.forEach(question => {
          if (question.category === 'Prototype methods'){
            question.category = 'Prototype Methods'
          }
        });
        this.setState({
          questions: results.fundamentalsQuestions
        });
      });
  }

  filterQuestionsByCategory = (category) => {
    let questionsFilteredByCategory = this.state.questions.filter(question => {
      if (question.category === category) {
        return question;
      }
    });

    return questionsFilteredByCategory;
  }

  getNumofQuestionsPerCategory = (categories) => {
    return categories.reduce((numPerCategory, curCategory) => {
      let total = 0;
      this.state.questions.forEach(question => {
        if (question.category === curCategory) {
          total += 1;
        }
      });
      numPerCategory[curCategory] = total;
      return numPerCategory;
    }, {});
  };

  getQuestionCategories = () => {
    return this.state.questions.reduce((categories, question) => {
      if (!categories.includes(question.category)) {
        categories.push(question.category);
      }
      return categories;
    }, []);
  }

  getQuestionIdsForNewCategory = (category, answeredCorrectIds) => {
    let filteredQuestions = this.filterQuestionsByCategory(category);
    
    if (answeredCorrectIds) {
      filteredQuestions = this.returnQuestionsNotAnsweredCorrectly(filteredQuestions, answeredCorrectIds);
    }

    let questionIds = filteredQuestions.map(filteredQuestion => {
      return filteredQuestion.id;
    });

    return questionIds;
  }

  updateCurrentQuestionId = () => {
    let nextQuestionIndex = (this.state.quizQuestionsIndex + 1);
    let currentQuestionId = this.state.quizQuestionsIds[nextQuestionIndex];
    this.setState({
      userStatus: 'guessing',
      userResult: '',
      quizQuestionsIndex: nextQuestionIndex,
      currentQuestionId
    });
  }
  
  resetQuiz = () => {
    this.setState({
      category: '',
      userStatus: '',
      userResult: '',
      quizQuestionsIds: [],
      quizQuestionsIndex: 0,
      currentQuestionId: '',
      correctCounter: 0
    });
  }

  returnQuestionsNotAnsweredCorrectly = (questions, answeredCorrectIds) => {
    return questions.filter(question => {
      return !answeredCorrectIds.includes(question.id);
    });
  }

  setupQuiz = (newCategory, answeredCorrectIds) => {
    let quizQuestionsIds = this.getQuestionIdsForNewCategory(newCategory, answeredCorrectIds);
    let currentQuestionId = quizQuestionsIds[0];
    this.setState({
      userStatus: 'guessing',
      category: newCategory,
      quizQuestionsIds,
      quizQuestionsIndex: 0,
      currentQuestionId
    });

  }

  skipQuestion = () => {
    this.checkIfFinalQuestion() ? this.setState({ userStatus: 'finished' }) : this.updateCurrentQuestionId();
  }

  updateUserStatusAndResult = (userStatus, userResult) => {
    this.setState({
      userStatus,
      userResult
    });
  }

  updateCorrectCounter = () => {
    this.setState({
      correctCounter: this.state.correctCounter + 1
    });
  }

  checkIfFinalQuestion = () => {
    if (this.state.quizQuestionsIndex === (this.state.quizQuestionsIds.length - 1)) {
      return true;
    }
    return false;
  }

  render() {
    let { category, questions, userStatus, userResult, quizQuestionsIds, currentQuestionId, correctCounter } = this.state;
    let categories = this.getQuestionCategories();
    let questionsPerCategory = this.getNumofQuestionsPerCategory(categories);
    let currentQuestion = '';
    let finalQuizQ = this.checkIfFinalQuestion();

    if (category !== '' && userStatus !== 'finished') {
      currentQuestion = questions.find(question => question.id === currentQuestionId);
    }

    return (
      <div className="App">
        <header>
          <i className="fas fa-home" onClick={this.resetQuiz}></i>
          <h1 className="title">Fundamentals In A Flash</h1>
        </header>
        {
          category === '' && <Welcome categories={categories} questionsPerCategory={questionsPerCategory} setupQuiz={this.setupQuiz}/>
        }
        {
          userStatus === 'guessing' && <Question currentQuestion={currentQuestion} skipQuestion={this.skipQuestion} questionNum={this.state.quizQuestionsIndex} totalQuizQuestions={quizQuestionsIds} updateUserStatusAndResult={this.updateUserStatusAndResult} updateCorrectCounter={this.updateCorrectCounter}/>
        }
        {
          userResult !== '' && <Message userResult={userResult} currentQuestion={currentQuestion} updateCurrentQuestionId={this.updateCurrentQuestionId} isFinalQuestion={finalQuizQ} updateUserStatusAndResult={this.updateUserStatusAndResult}/>
        }
        {
          userStatus === 'finished' && <QuizSummary category={category} numberCorrect={correctCounter} totalQuestions={quizQuestionsIds.length} resetQuiz={this.resetQuiz}/>
        }
      </div>
    );
  }
}

export default App;
