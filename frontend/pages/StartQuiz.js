export default {
    template: `
        <div class="container mt-5">
            <div class="quiz-container">
                <h4 class="text-center">Quiz: {{ quiz.quiz_title }}</h4>
                <h5 class="text-center">Time Remaining: <span>{{ formattedTime }}</span></h5>

                <form v-if="questions.length" @submit.prevent="submitQuiz">
                    <div v-for="(question, index) in questions" :key="question.id" class="mb-4">
                        <h5>{{ index + 1 }}. {{ question.question_statement }}</h5>
                        
                        <!-- Render options individually --> 
                        <div>
                            <div v-if="question.option1">
                                <input type="radio" :name="'q' + question.id" :value="question.option1" 
                                    :id="'q' + question.id + 'opt1'" v-model="answers[question.id]">
                                <label :for="'q' + question.id + 'opt1'">{{ question.option1 }}</label>
                            </div>

                            <div v-if="question.option2">
                                <input type="radio" :name="'q' + question.id" :value="question.option2" 
                                    :id="'q' + question.id + 'opt2'" v-model="answers[question.id]">
                                <label :for="'q' + question.id + 'opt2'">{{ question.option2 }}</label>
                            </div>

                            <div v-if="question.option3">
                                <input type="radio" :name="'q' + question.id" :value="question.option3" 
                                    :id="'q' + question.id + 'opt3'" v-model="answers[question.id]">
                                <label :for="'q' + question.id + 'opt3'">{{ question.option3 }}</label>
                            </div>

                            <div v-if="question.option4">
                                <input type="radio" :name="'q' + question.id" :value="question.option4" 
                                    :id="'q' + question.id + 'opt4'" v-model="answers[question.id]">
                                <label :for="'q' + question.id + 'opt4'">{{ question.option4 }}</label>
                            </div>
                        </div>

                        <p v-if="!question.option1 && !question.option2 && !question.option3 && !question.option4" class="text-danger">
                            No options available
                        </p>
                    </div>
                    
                    <button type="submit" class="btn btn-success w-100">Submit Quiz</button>
                </form>

                <p v-else class="text-center text-danger">No questions available for this quiz.</p>
            </div>
        </div>
    `,


    data() {
        return {
            quiz: {},
            questions: [],
            answers: {},  
            timeRemaining: 0,
            timerInterval: null
        };
    },

    computed: {
        formattedTime() {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    },

    methods: {
        async fetchQuizData() {
            const quizId = this.$route.params.quizId;
            console.log("Fetching quiz data for Quiz ID:", quizId);

            try {
                const authToken = this.$store?.state?.auth_token || localStorage.getItem("auth_token");
                if (!authToken) {
                    throw new Error("User not authenticated. Please log in.");
                }

                const res = await fetch(`${location.origin}/api/quizzes/${quizId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': authToken
                    }
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch quiz data: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                console.log("Quiz Data Fetched:", data);

                this.quiz = data;
                this.questions = Array.isArray(data.questions) ? data.questions : [];
                console.log("Fetched Questions:", this.questions); 
                this.timeRemaining = (parseInt(data.time_duration, 10) || 0) * 60;

                if (this.timeRemaining > 0) {
                    this.startTimer();
                }
            } catch (error) {
                console.error("Error fetching quiz data:", error);
                alert(error.message);
            }
        },

        startTimer() {
            if (this.timerInterval) clearInterval(this.timerInterval);

            this.timerInterval = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    clearInterval(this.timerInterval);
                    alert("Time is up! Submitting quiz...");
                    this.submitQuiz();
                }
            }, 1000);
        },

        calculateScore() {
            let correctAnswers = 0;
            const totalQuestions = this.questions.length;
            const totalScore = 100;

            this.questions.forEach((question) => {
                if (this.answers[question.id] == question.correct_option) {
                    correctAnswers++;
                }
            });

            const scoreGain = totalQuestions > 0 ? (correctAnswers / totalQuestions) * totalScore : 0;

            console.log(` Correct Answers: ${correctAnswers} / ${totalQuestions}`);
            console.log(` Calculated Score: ${scoreGain} / ${totalScore}`);

            return { scoreGain: Math.round(scoreGain), totalScore };
        },

        async submitQuiz() {
            clearInterval(this.timerInterval);
            console.log("Submitting Quiz:", this.answers);

            const authToken = this.$store?.state?.auth_token || localStorage.getItem("auth_token");
            const userId = this.$store?.state?.user_id || JSON.parse(localStorage.getItem("user"))?.user_id;
            const subjectId = this.$route.params.subjectId;
            const chapterId = this.$route.params.chapterId;
            const quizId = this.$route.params.quizId;

            const { scoreGain, totalScore } = this.calculateScore();
            const totalTime = (this.quiz.time_duration || 0) * 60;
            const timeSpent = totalTime - this.timeRemaining;
            const timeSpentSeconds = Math.max(timeSpent, 1);
            const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
            const remainingSeconds = timeSpentSeconds % 60;

            console.log(`✅ Time Spent: ${timeSpentMinutes} minutes and ${remainingSeconds} seconds`);

            const payload = {
                user_id: userId,
                quiz_id: quizId,
                total_scored: totalScore,
                score_gain: scoreGain,
                time_spent_minutes: timeSpentMinutes,
                time_spent_remaining_seconds: remainingSeconds
            };

            try {
                await fetch(`${location.origin}/api/scores/${userId}/${subjectId}/${chapterId}/${quizId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': authToken
                    },
                    body: JSON.stringify(payload)
                });

                alert(`Quiz submitted! Your score: ${scoreGain.toFixed(2)}`);
                this.$router.push(`/subjects/${subjectId}/chapters/${chapterId}/quizzes/${quizId}/result`);
            } catch (error) {
                console.error(" Error submitting quiz:", error);
                alert(error.message);
            }
        }
    },

    async mounted() {
        await this.fetchQuizData();
    }
};
