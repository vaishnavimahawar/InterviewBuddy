<h1 align="center">InterviewIQ Engine</h1> <p align="center"> <b>A concurrent answer-scoring engine in C++ behind a Spring Boot interview-prep platform.</b><br/> Custom inverted index &middot; TF-IDF cosine similarity &middot; thread pool &middot; reader-writer locking </p> <p align="center"> <img src="https://img.shields.io/badge/Java-11+-orange" /> <img src="https://img.shields.io/badge/C%2B%2B-17-blue" /> <img src="https://img.shields.io/badge/Spring%20Boot-REST-6DB33F" /> <img src="https://img.shields.io/badge/PostgreSQL-12+-336791" /> <img src="https://img.shields.io/badge/License-MIT-lightgrey" /> </p>
Why this exists

Scoring a free-text interview answer means tokenizing it, weighting terms and comparing it against reference answers. Done per request inside a general-purpose web stack, that step becomes the bottleneck as users grow.

This project moves that hot path into a purpose-built C++ engine and keeps everything else (auth, persistence, API) in Spring Boot. It is also a deliberate exercise in the problems database and search engines solve: index structures, concurrent reads with rare writes, and measuring performance honestly.

At a glance
	
Platform	100+ role-specific questions, JWT-secured REST API, performance tracking, knowledge-gap feedback
Engine	Inverted index, TF-IDF weighting, cosine similarity, fixed thread pool
Concurrency model	Many parallel readers (scoring), exclusive writer (index updates) via std::shared_mutex
Beta results	4.5 / 5 satisfaction across 200+ testers; 500+ concurrent users handled
Answer categorization accuracy	87% (measured on the original Java pipeline; re-verify for the C++ engine)
Status

Honest tracking of what exists today versus what is planned.

Component	Status
Spring Boot REST API, JWT auth, PostgreSQL persistence	Implemented
TF-IDF and semantic-similarity scoring (Java)	Implemented
C++ inverted index and TF-IDF cosine similarity	Implemented
C++ thread pool and shared_mutex index access	Implemented
Java-to-C++ bridge ([TCP / CLI])	Planned
Benchmark suite and published results	Planned
ThreadSanitizer and concurrency stress tests	Planned
Architecture
REST + JWT
persist
score(answer)
similarity scores
C++ Engine
shared lock
shared lock
shared lock
Request queue
Worker 1
Worker 2
Worker N
Inverted index
Client
Spring Boot API
PostgreSQL
Bridge: TCP / CLI





Request lifecycle

Client submits an answer to POST /api/answers.
The Java service authenticates the user and forwards the answer to the engine.
A worker thread tokenizes the answer and scores it against the reference documents under a shared lock.
Scores return to the service, which categorizes the answer, stores the result and responds with feedback.
Engine internals
Data structures
postings : term -> [(docId, termFrequency), ...]     // the inverted index
docTf    : docId -> { term -> termFrequency }        // per-document vectors
Scoring

For a query answer q and reference document d:

w(t, x)   = tf(t, x) * idf(t)
idf(t)    = ln((1 + N) / (1 + df(t))) + 1
score     = sum_t w(t,q) * w(t,d)  /  ( ||w(q)|| * ||w(d)|| )

Smoothed IDF avoids division by zero for unseen terms and keeps scores stable on small corpora.

Complexity
Operation	Cost
add_document	O(L) for L tokens, plus one postings append per distinct term
similarity	O(|q| + |d|) expected, using hash lookups
Lookup of a term's df	O(1) expected
Design decisions
Decision	Alternatives considered	Why this one
std::shared_mutex	std::mutex; lock-free structures	Workload is read-heavy: scoring is constant, index updates are rare. Readers should not block each other. A mutex baseline is kept for comparison.
Fixed-size thread pool	Thread per request	Bounded resource use and no thread-creation cost on the hot path.
Hash-map inverted index	Sorted vectors; trie	O(1) expected term lookup, simple to reason about. Sorted postings are a roadmap item for intersection queries.
Smoothed TF-IDF	Raw TF-IDF; BM25	Stable on small corpora. BM25 is a candidate once there is a dataset to compare on.
Separate engine process	JNI	Crash isolation, independent restarts, and the engine stays testable on its own. JNI avoids IPC cost; revisit if the bridge dominates latency.
Concurrency model

Invariants

The index is only mutated while holding the exclusive lock.
Scoring only reads the index while holding the shared lock.
No lock is held while waiting on the task queue, so workers cannot deadlock against the index.
Pool shutdown drains queued jobs, then joins all workers.

Known trade-offs

A long stream of readers can delay a pending writer, depending on the standard library's lock fairness. Acceptable here because writes are rare.
Scoring holds the shared lock for the whole computation. Copying the needed postings and releasing early is a possible refinement if writers ever need lower latency.
Benchmarks

Methodology is fixed before running, so the numbers are comparable.

Method

Same reference corpus and the same set of N answers for every run
Warm-up pass discarded, then [R] timed runs; report the median and p95 latency
Threads varied at 1, 4 and 8; Java baseline measured on the same machine
Record machine, compiler and flags: g++ -O2 -std=c++17 -pthread

Setup: [CPU, cores, RAM, corpus size, answers per run]

Implementation	Threads	Median latency	p95 latency	Throughput
Java baseline	n/a	[ ] ms	[ ] ms	[ ] req/s
C++ engine (shared_mutex)	1	[ ] ms	[ ] ms	[ ] req/s
C++ engine (shared_mutex)	4	[ ] ms	[ ] ms	[ ] req/s
C++ engine (shared_mutex)	8	[ ] ms	[ ] ms	[ ] req/s
C++ engine (mutex)	8	[ ] ms	[ ] ms	[ ] req/s
Testing and correctness
Unit tests (Java): JUnit 5 and Mockito for services and controllers
Engine checks: known-answer tests for tokenization and similarity (identical text scores 1.0, disjoint text scores 0.0)
Planned: build with ThreadSanitizer (-fsanitize=thread) and run a stress test with concurrent readers and a writer to confirm there are no data races
Tech stack
Layer	Technology
Backend	Java, Spring Boot, Spring MVC, JWT
Engine	C++17, std::thread, std::shared_mutex
NLP	TF-IDF, semantic similarity
Data	PostgreSQL
Testing	JUnit 5, Mockito
Build	Maven, g++
Getting started

Prerequisites: Java 11+, Maven 3.6+, PostgreSQL 12+, g++ with C++17.

bash
git clone https://github.com/vaishnavimahawar/InterviewBuddy.git
cd InterviewBuddy

# database
createdb interview_buddy
psql interview_buddy < schema.sql
cp application.properties.example src/main/resources/application.properties

# C++ engine
cd cpp-engine
g++ -std=c++17 -O2 -pthread interviewbuddy_engine.cpp -o engine && ./engine
cd ..

# Java backend
mvn clean install
mvn spring-boot:run        # http://localhost:8080
API
Method	Endpoint	Purpose
POST	/api/auth/register	Create an account
POST	/api/auth/login	Authenticate and receive a JWT
GET	/api/questions?role=backend_engineer&difficulty=medium	Role-specific questions
POST	/api/answers	Submit { "questionId", "answer" }, receive analysis and score
GET	/api/user/performance	Improvement metrics
GET	/api/user/weak-areas	Topics to revisit
Repository layout
.
|-- src/            Spring Boot backend
|-- cpp-engine/     inverted index, TF-IDF scoring, thread pool
|-- schema.sql      PostgreSQL schema
|-- pom.xml
`-- README.md
Roadmap
 Java-to-C++ bridge and end-to-end integration
 Publish benchmark results with the methodology above
 ThreadSanitizer run and concurrent stress test
 mutex vs shared_mutex comparison under mixed read/write load
 Sorted postings and BM25 scoring experiment
 Persist the index to disk for fast restarts
What building this taught me
Where the real bottleneck is only becomes clear after profiling the pipeline, so measure before moving code between languages.
A read-heavy workload justifies reader-writer locking, but the fairness trade-offs have to be understood, not assumed.
Documenting invariants (who holds which lock, and when) catches concurrency bugs earlier than testing alone.
Contributing

Issues and pull requests are welcome. Please open an issue first for larger changes.

License

MIT

Author

Vaishnavi Mahawar Email · GitHub · LinkedIn
