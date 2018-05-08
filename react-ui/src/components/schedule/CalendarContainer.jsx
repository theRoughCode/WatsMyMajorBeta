import React, { Component } from 'react';
import { Calendar, Event } from './calendar';
import moment from 'moment';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import DatePicker from 'material-ui/DatePicker';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import DateIcon from 'material-ui/svg-icons/editor/insert-invitation';
import LeftIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import RightIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import DayIcon from 'material-ui/svg-icons/action/view-day';
import MultipleDaysIcon from 'material-ui/svg-icons/action/view-week';
import RandomColour from 'randomcolor';
import { addDays, diffDays, startOfDay } from './calendar/dateUtils';

const color1 = '#049BE5';
const color2 = '#33B679';
const color3 = '#E67B73';

const referenceDate = new Date(2017, 1, 1);

const modeNbOfDaysMap = {
	day: 1,
	'3days': 3,
	week: 7
}

const styles = {
	iconContainer: {
		marginTop: 2,
		marginRight: 20
	},
	toggleMenu: {
		borderRadius: 35,
		minWidth: 35,
		height: 35,
		lineHeight: 0
	},
	dateIcon: {
		borderRadius: 40,
		minWidth: 40,
		height: 40,
		lineHeight: 0,
		margin: 10
	},
	today: {
		minWidth: 40,
		display: 'inline-block',
    verticalAlign: 'top',
		lineHeight: 0,
		marginTop: 11,
		marginRight: 10
	},
	arrows: {
		borderRadius: 20,
		height: 'auto',
		minWidth: 0,
		lineHeight: 0
	}
};

function addTime(date, hours, minutes) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes == null ? 0 : minutes);
}

function parseCourses(courses) {
	const classesArr = [];

	courses.map(({ subject, catalogNumber, classes }) => {
		const colour = RandomColour({ luminosity: 'dark' });
		Object.entries(classes).map(arr => {
			const type = arr[0];

			const {
				classNum,
				section,
				days,
				startTime,
				endTime,
				location,
				instructor,
				startDate,
				endDate
			} = arr[1];

			const startDateMoment = moment(startDate, "DD/MM/YYYY");
			const endDateMoment = moment(endDate, "DD/MM/YYYY");
			const startTimeMoment = moment(startTime, "hh:mmA");
			const endTimeMoment = moment(endTime, "hh:mmA");

			let date = startDateMoment;
			while (date.isSameOrBefore(endDateMoment)) {
				days.map(dayStr => {
					let day = 0;
					switch (dayStr) {
						case 'M': day = 1; break;
						case 'T': day = 2; break;
						case 'W': day = 3; break;
						case 'Th': day = 4; break;
						case 'F': day = 5; break;
						default: day = 6;
					}

					const startOfWeekMoment = date.startOf('week');
					const startDay = startOfWeekMoment.day();
					const startDate = startOfWeekMoment.date();

					// ensure valid date
					const currDayMoment = startOfWeekMoment.add(day, 'days');
					if (currDayMoment.isSameOrAfter(startDateMoment) || currDayMoment.add(day, 'days').isSameOrBefore(endDateMoment)) {
						const start = new Date(date.year(), date.month(), currDayMoment.date(), startTimeMoment.hour(), startTimeMoment.minute());
						const end = new Date(date.year(), date.month(), currDayMoment.date(), endTimeMoment.hour(), endTimeMoment.minute());

						classesArr.push({
							subject,
							catalogNumber,
							type,
							colour,
							classNum,
							section,
							days,
							start,
							end,
							location,
							instructor
						});
					}
				});
				date = date.add(7, 'days');
			}
		});
	});

	return classesArr;
}

class CalendarContainer extends Component {

  constructor(props: any) {
    super(props);

    const date = new Date(2018, 2, 27);
		const courses = [{
			"subject":"CS",
			"catalogNumber":"240E",
			"classes": {
				"TUT": {
					"classNum":"8305",
					"section":"101",
					"days":["M"],
					"startTime":"3:30PM",
					"endTime":"4:20PM",
					"location":"MC 2017",
					"instructor":"Staff",
					"startDate":"03/01/2018",
					"endDate":"04/04/2018"
				},
				"TST": {
					"classNum":"8306",
					"section":"201",
					"days":["Th"],
					"startTime":"4:30PM",
					"endTime":"6:20PM",
					"location":"TBA",
					"instructor":"Karen Anderson",
					"startDate":"15/02/2018",
					"endDate":"15/02/2018"
				},
				"LEC": {
					"classNum":"8304",
					"section":"001",
					"days":["T", "Th"],
					"startTime":"8:30AM",
					"endTime":"9:50AM",
					"location":"MC 4061",
					"instructor":"Prabhakar Ragde",
					"startDate":"03/01/2018",
					"endDate":"04/04/2018"
				}
			}
		}];

    this.state = {
      date: date,
      mode: 'day',
      classes: parseCourses(courses),
    };

		this.setDate = this.setDate.bind(this);
		this.getDate = this.getDate.bind(this);
		this.getIndex = this.getIndex.bind(this);
		this.changeMode = this.changeMode.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
		this.openDatePicker = this.openDatePicker.bind(this);
  }

  setDate(date) {
    this.setState({ date: date });
  }

	onChangeIndex(index) {
		const date = addDays(referenceDate, index * modeNbOfDaysMap[this.getMode()]);
		this.unControlledDate = date;
		this.setDate(date);
	}

	getMode() {
		return this.state.mode == null ? 'day' : this.state.mode;
	}

  changeMode(mode) {
    this.setState({ mode: mode, isOpen: false});
  }

	getDate() {
		return this.state.date != null ? this.state.date : this.unControlledDate;
	}

	getIndex() {
		return Math.round(diffDays(startOfDay(this.getDate()), referenceDate) / modeNbOfDaysMap[this.getMode()]);
	}

  toggleMenu() {
    this.setState({ isOpen: !this.state.isOpen });
  }

	openDatePicker() {
		this.refs.dp.openDialog();
	}

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Drawer
          docked={ false }
          open={ this.state.isOpen }
          onRequestChange={ this.toggleMenu }>
          <MenuItem leftIcon={ <DayIcon /> } onClick={ () => this.changeMode('day') }>Day</MenuItem>
          <MenuItem leftIcon={ <MultipleDaysIcon /> } onClick={ () => this.changeMode('3days') }>3 Days</MenuItem>
          <MenuItem leftIcon={ <MultipleDaysIcon /> } onClick={ () => this.changeMode('week') }>Week</MenuItem>
        </Drawer>
        <AppBar
          style={{ background: 'white', position: 'relative' }}
          titleStyle={{
						color: 'black',
						textAlign: 'left',
						marginBottom: 10
					}}
          title={ `${moment(this.state.date).format('MMM YYYY')}` }
					iconStyleLeft={ styles.iconContainer }
          iconElementLeft={
						<div>
							<FlatButton
								style={ styles.toggleMenu }
								onClick={ this.toggleMenu }
							>
								<MenuIcon color='black' />
							</FlatButton>
							<FlatButton
								style={ styles.dateIcon }
								onClick={ this.openDatePicker }
							>
								<DateIcon color='grey' />
							</FlatButton>
							<FlatButton
								label="Today"
								style={ styles.today }
								labelStyle={ styles.todayLabel }
								backgroundColor="rgba(0,0,0,0.04)"
								onClick={ () => this.setDate(new Date()) }
							/>
							<FlatButton
								style={ styles.arrows }
								onClick={ () => this.onChangeIndex(this.getIndex() - 1) }
							>
								<LeftIcon color='grey' style={{ margin: 'auto' }} />
							</FlatButton>
							<FlatButton
								style={ styles.arrows }
								onClick={ () => this.onChangeIndex(this.getIndex() + 1) }
							>
								<RightIcon color='grey' style={{ margin: 'auto' }} />
							</FlatButton>
						</div>
					}
        />
				<DatePicker
					ref="dp"
					name="dp"
					style={{ display: 'none' }}
					onChange={ (_, date) => this.setDate(date) }
					value={ this.state.date }
				/>
        <Calendar
          style={{ height: '100%', width: '100%' }}
          date={ this.state.date }
					referenceDate={ referenceDate }
          mode={ this.state.mode }
					getIndex={ this.getIndex }
				>
          {
            this.state.classes
              .map((classElem, index) => (
              <Event
                key={ index }
                background={ classElem.colour }
                title={ `${classElem.subject} ${classElem.catalogNumber}` }
								onClick={ () => {} }
								{ ...classElem }
              />
            ))
          }
        </Calendar>
      </div>
    );
  }
}

export default CalendarContainer;
