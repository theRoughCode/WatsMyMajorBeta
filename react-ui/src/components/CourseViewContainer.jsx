import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import CourseContent from './courseview/CourseContent';
import CourseSideBar from './courseview/CourseSideBarContainer';
import { setCourse, setExpandedCourse } from '../actions/index';


const styles = {
	loading: {
		margin: 'auto'
	}
};

const getCourseData = (subject, catalogNumber) => {
	return fetch(`/wat/${subject}/${catalogNumber}`)
	.then(response => {
		if (!response.ok) {
			throw new Error(`status ${response.status}`);
		}
		return response.json();
	});
};


class CourseViewContainer extends Component {

	static propTypes = {
		subject: PropTypes.string,
		catalogNumber: PropTypes.string,
		instructor: PropTypes.string,
		attending: PropTypes.string,
		enrollmentCap: PropTypes.string,
		classNumber: PropTypes.string,
		selectedClassIndex: PropTypes.number,
		selectCourseHandler: PropTypes.func.isRequired,
		expandCourseHandler: PropTypes.func.isRequired
	};

	static defaultProps = {
		subject: 'CS',
		catalogNumber: '100',
		instructor: '',
		attending: '',
		enrollmentCap: '',
		classNumber: '',
		selectedClassIndex: -1
	}

	constructor(props) {
		super(props);

		this.state = {
			course: {
				loading: true,
				error: false,
				subject: props.subject,
				catalogNumber: props.catalogNumber,
				title: '',
				rating: 0,
				termsOffered: [],
				description: '',
				antireqs: [],
				coreqs: [],
				prereqs: [],
				postreqs: []
			},
			classInfo: {
				loading: true,
				error: false,
				instructor: props.instructor,
				attending: props.attending,
				enrollmentCap: props.enrollmentCap,
				classNumber: props.classNumber
			},
			selectedClassIndex: props.selectedClassIndex,
			selectCourseHandler: props.selectCourseHandler,
			expandCourseHandler: props.expandCourseHandler
		}
	}

	componentDidMount() {
		const { subject, catalogNumber } = this.props;

		if (subject && catalogNumber) {
			// fetch course data
			getCourseData(subject, catalogNumber)
			.then(json => {
				const {
					title,
					description,
					prereqs,
					antireqs,
					coreqs,
					crosslistings,
					terms,
					url,
					parPrereq,
					parCoreq
				} = json;

				console.log('json', json);

				const course = Object.assign({}, this.state.course, {
					loading: false,
					title,
					description,
					rating: 2.1,
					termsOffered: terms,
					antireqs,
					coreqs,
					prereqs,
					postreqs: parPrereq
				});

				this.setState({ course });
			}).catch(error => {
				console.error(`ERROR: ${error}`);
				const course = Object.assign({}, this.state.course, {
					loading: false,
					error
				});
				this.setState({ course });
				return;
			});
		} else {
			const course = Object.assign({}, this.state.course, {
				loading: false,
				title: 'Introduction to Data Abstraction and Implementation',
				description: 'Software abstractions via elementary data structures and their implementation; encapsulation and modularity; class and interface definitions; object instantiation; recursion; elementary abstract data types, including sequences, stacks, queues, and trees; implementation using linked structures and arrays; vectors and strings; memory models; automatic vs. dynamic memory management.',
				rating: 3.5,
				termsOffered: ['F', 'W'],
				antireqs: ['CS 234', 'CS 235'],
				coreqs: ['CS 222', 'CS 232'],
				prereqs: ['CS 137', 'CS 138'],
				postreqs: ['CS 371', 'CS 472']
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps !== this.props) {
			const isNewCourse = (this.props.subject !== nextProps.subject || this.props.catalogNumber !== nextProps.catalogNumber);
			const isNewClass = (this.props.classNumber !== nextProps.classNumber);

			// User selected new course
			if (isNewCourse) {
				const { subject, catalogNumber } = nextProps;

				let course = Object.assign({}, this.state.course, {
					subject,
					catalogNumber,
					loading: true
				});

				this.setState({ course });

				// fetch course data
				getCourseData(subject, catalogNumber)
				.then(json => {
					const {
						title,
						description,
						prereqs,
						antireqs,
						coreqs,
						crosslistings,
						terms,
						url,
						parPrereq,
						parCoreq
					} = json;

					console.log('json', json);

					course = Object.assign({}, this.state.course, {
						loading: false,
						title,
						description,
						rating: 2.1,
						termsOffered: terms,
						antireqs,
						coreqs,
						prereqs,
						postreqs: parPrereq
					});

					this.setState({ course });
				}).catch(error => {
					console.error(`ERROR: ${error}`);
					course = Object.assign({}, this.state.course, {
						loading: false,
						error
					});
					this.setState({ course });
					return;
				});
			}

			// User selected new class
			if (isNewClass) {
				const {
					instructor,
					attending,
					enrollmentCap,
					classNumber,
					selectedClassIndex
				} = nextProps;

				let classInfo = Object.assign({}, this.state.classInfo, {
					instructor,
					attending,
					enrollmentCap,
					classNumber
				});

				this.setState({ classInfo, selectedClassIndex });
			}
		}
	}

	render() {
		const loadingView = (
			<div className="loading">
				<CircularProgress
					size={80}
					thickness={5}
					style={styles.loading}
					/>
			</div>
		);

		const errorView = (
			<div className="error-wrapper">
				<span>{`Oops!  We encountered an error trying to fetch ${this.state.course.subject} ${this.state.course.catalogNumber}.`}</span>
				<span>{`Error message: ${this.state.course.error}`}</span>
			</div>
		)

		const renderedView = (
			<div className="course-view">
				<CourseContent
					selectedClassIndex={this.state.selectedClassIndex}
					selectCourseHandler={this.state.selectCourseHandler}
					expandCourseHandler={this.state.expandCourseHandler}
					subject={this.state.course.subject}
					catalogNumber={this.state.course.catalogNumber}
					title={this.state.course.title}
					rating={this.state.course.rating}
					termsOffered={this.state.course.termsOffered}
					description={this.state.course.description}
					antireqs={this.state.course.antireqs}
					coreqs={this.state.course.coreqs}
					prereqs={this.state.course.prereqs}
					postreqs={this.state.course.postreqs}
					/>
				<CourseSideBar
					instructor={this.state.classInfo.instructor}
					attending={this.state.classInfo.attending}
					enrollmentCap={this.state.classInfo.enrollmentCap}
					classNumber={this.state.classInfo.classNumber}
					/>
			</div>
		);

		if (this.state.loading) {
			return loadingView;
		} else if (this.state.error) {
			return errorView;
		} else {
			return renderedView;
		}
	}

}

const mapStateToProps = ({ course, expandedCourse }) => {
	const { subject, catalogNumber } = course;
	const {
		instructor,
		attending,
		enrollmentCap,
		classNumber,
		selectedClassIndex
	} = expandedCourse;

	return {
		subject,
		catalogNumber,
		instructor,
		attending,
		enrollmentCap,
		classNumber,
		selectedClassIndex
	};
};

const mapDispatchToProps = dispatch => {
	return {
		selectCourseHandler: (subject, catalogNumber) => {
			dispatch(setCourse(subject, catalogNumber));
		},
		expandCourseHandler: (courseObj, index) => {
			dispatch(setExpandedCourse(courseObj, index));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseViewContainer);
