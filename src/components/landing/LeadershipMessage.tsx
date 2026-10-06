import Image from "next/image";

/** "Message from the Head of Reporting Officers" section. */
export default function LeadershipMessage() {
  return (
    <section className="message" id="message">
      <div className="container">
        <div className="section-head reveal">
          <div className="eyebrow">From the leadership</div>
          <h2>Message from the Head of Reporting Officers</h2>
        </div>

        <div className="message-card reveal">
          <div className="message-side">
            <div className="message-avatar">
              <Image src="/assets/Umar.png" alt="Head of Reporting Officers" width={150} height={150} />
            </div>
            <div>
              <div className="m-name">Head of Reporting Officers</div>
              <div className="m-role">Youth Leadership Program 2.0</div>
              <div className="m-org">Combine Foundation</div>
            </div>
          </div>

          <div className="message-body">
            <span className="quote-mark" aria-hidden="true">&ldquo;</span>
            <p>
              I believe young people can make a meaningful difference when they receive the right guidance,
              opportunities, and trust. At Combine Foundation, the Youth Leadership Program (YLP) puts this belief
              into practice by giving young people the opportunity to learn, take responsibility, and serve their
              communities.
            </p>
            <p>
              As Head of Reporting Officers, my commitment is to help our Youth Leaders turn their passion into
              purposeful action. Working alongside our Senior Reporting Officers and Reporting Officers, I aim to
              build an environment where participants feel supported, take ownership of their commitments, and grow
              through practical experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
