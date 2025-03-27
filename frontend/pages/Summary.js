export default {
    template: `
    <div class="container my-5">
    <h2 class="text-center mb-5 p-3 bg-primary text-white">📊 Summary Dashboard</h2>
    <div class="row g-4"> <!-- g-4 for more gap between cards -->
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">📊 Total Counts</h5>
                <canvas id="barChart"></canvas>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">🥧 Users' Quiz Attempts</h5>
                <canvas id="pieChart"></canvas>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">📈 Score Trends</h5>
                <canvas id="lineChart"></canvas>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">📊 Score Distribution</h5>
                <canvas id="histogramChart"></canvas>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">📆 Quiz Attempts Over Time</h5>
                <canvas id="attemptTrendChart"></canvas>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">🏆 Top Performing Users</h5>
                <canvas id="topUsersChart"></canvas>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">📚 Subject Popularity</h5>
                <canvas id="subjectPopularityChart"></canvas>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card p-4 shadow-lg">
                <h5 class="text-center fw-bold">📊 Average Score Per Subject</h5>
                <canvas id="avgScoreChart"></canvas>
            </div>
        </div>
    </div>
</div>


    `,
    data() {
        return {
            summaryData: null
        };
    },
    async mounted() {
        await this.loadSummary();
    },
    methods: {
        async loadSummary() {
            const authToken = this.$store.state.auth_token;

            if (!authToken) {
                console.error("❌ Authentication token missing!");
                alert("Authentication required!");
                this.$router.push('/login'); // Redirect to login page
                return;
            }

            try {
                const response = await axios.get(`${location.origin}/api/summary`, {
                    headers: { 'Authentication-Token': authToken }
                });

                this.summaryData = response.data;
                console.log("✅ Summary Data:", this.summaryData);
                this.renderCharts();

            } catch (error) {
                console.error("❌ Error fetching summary data:", error);
                alert("Failed to load summary data.");
            }
        },

        renderCharts() {
            if (!this.summaryData) return;
        
            // 📊 Bar Chart - Subjects, Quizzes, Users, Chapters Count
            new Chart(document.getElementById('barChart'), {
                type: 'bar',
                data: {
                    labels: ['Subjects', 'Quizzes', 'Users', 'Chapters'],
                    datasets: [{
                        label: 'Counts',
                        data: [
                            this.summaryData.total_subjects, 
                            this.summaryData.total_quizzes, 
                            this.summaryData.total_users, 
                            this.summaryData.total_chapters
                        ],
                        backgroundColor: ['red', 'blue', 'green', 'purple']
                    }]
                },
                
            });
        
            // 🥧 Pie Chart - Users' Quiz Attempts
            new Chart(document.getElementById('pieChart'), {
                type: 'pie',
                data: {
                    labels: ['Attempted', 'Not Attempted'],
                    datasets: [{
                        data: this.summaryData.quiz_attempt_distribution,
                        backgroundColor: ['yellow', 'green']
                    }]
                },
                
            });
        
            // 📈 Line Chart - Score Trends
            new Chart(document.getElementById('lineChart'), {
                type: 'line',
                data: {
                    labels: Array.from({ length: this.summaryData.scores.length }, (_, i) => i + 1),
                    datasets: [{
                        label: 'Quiz Score Trends',
                        data: this.summaryData.scores,
                        borderColor: 'blue',
                        fill: false
                    }]
                },
               
            });
        
            // 📊 Histogram - Score Distribution
            new Chart(document.getElementById('histogramChart'), {
                type: 'bar',
                data: {
                    labels: this.summaryData.scores,
                    datasets: [{
                        label: 'Score Frequency',
                        data: this.summaryData.scores,
                        backgroundColor: 'green'
                    }]
                },
                
            });
        
            // 📆 Quiz Attempts Over Time
            new Chart(document.getElementById('attemptTrendChart'), {
                type: 'bar',
                data: {
                    labels: this.summaryData.quiz_attempt_dates,
                    datasets: [{
                        label: 'Quiz Attempts Over Time',
                        data: Array(this.summaryData.quiz_attempt_dates.length).fill(1),
                        backgroundColor: 'royalblue'
                    }]
                },
                
            });
        
            // 🏆 Top Performing Users
            new Chart(document.getElementById('topUsersChart'), {
                type: 'bar',
                data: {
                    labels: this.summaryData.top_users.map(user => user.name),
                    datasets: [{
                        label: 'Total Score',
                        data: this.summaryData.top_users.map(user => user.total_score),
                        backgroundColor: 'orange'
                    }]
                },
                
            });
        
            // 📚 Subject Popularity
            new Chart(document.getElementById('subjectPopularityChart'), {
                type: 'pie',
                data: {
                    labels: this.summaryData.subject_popularity.map(sub => sub.name),
                    datasets: [{
                        data: this.summaryData.subject_popularity.map(sub => sub.quiz_count),
                        backgroundColor: ['red', 'blue', 'green', 'yellow']
                    }]
                },
                
            });
        
            // 📊 Average Score Per Subject
            new Chart(document.getElementById('avgScoreChart'), {
                type: 'bar',
                data: {
                    labels: this.summaryData.avg_scores_per_subject.map(sub => sub.name),
                    datasets: [{
                        label: 'Average Score',
                        data: this.summaryData.avg_scores_per_subject.map(sub => sub.avg_score),
                        backgroundColor: 'purple'
                    }]
                },
                
            });
        }
    }
}
