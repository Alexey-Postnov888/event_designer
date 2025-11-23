import "../../../styles/event-details/event-details-timeline.css";

export default function TimelineTab({ event }) {
  const timeline = [
    {
      time: "13:00",
      text: "Задача организации, в особенности же укрепление и развитие внутренней структуры позволяет выполнить важные задания по разработке как самодостаточных, так и внешне зависимых концептуальных решений.",
    },
    {
      time: "14:00",
      text: "Современные технологии достигли такого уровня, что выбранный нами инновационный путь позволяет оценить значение соответствующих условий активизации.",
    },
    {
      time: "15:00",
      text: "Также как начало повседневной работы по формированию позиции говорит о возможностях соответствующих условий активизации.",
    },
    {
      time: "16:00",
      text: "В целом, конечно, синтетическое тестирование обеспечивает актуальность системы массового участия.",
    },
    {
      time: "17:00",
      text: "Значимость этих проблем настолько очевидна, что перспективное планирование требует определения и уточнения приоритизации разума над эмоциями.",
    },
 
  ];

  return (
    <section className="event-details-content">
      <div className="event-details-content-card event-timeline-card">
        <ul className="event-timeline-list">
          {timeline.map((item, index) => (
            <li className="event-timeline-item" key={index}>
              <div className="event-timeline-time">{item.time}</div>

              <div className="event-timeline-dot-wrapper">
                <span className="event-timeline-dot" />
              </div>

              <p className="event-timeline-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}