/* === USER ALERTS ===================================================== */

CREATE TYPE solaruser.user_alert_status AS ENUM 
	('Active', 'Disabled', 'Suppressed');

CREATE TYPE solaruser.user_alert_type AS ENUM 
	('NodeStaleData');

CREATE TYPE solaruser.user_alert_sit_status AS ENUM 
	('Active', 'Resolved');

CREATE SEQUENCE solaruser.user_alert_seq;

CREATE TABLE solaruser.user_alert (
	id				BIGINT NOT NULL DEFAULT nextval('solaruser.user_alert_seq'),
	created			TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	user_id			BIGINT NOT NULL,
	node_id			BIGINT,
	alert_type		solaruser.user_alert_type NOT NULL,
	status			solaruser.user_alert_status NOT NULL,
	alert_opt		json,
	CONSTRAINT user_alert_pkey PRIMARY KEY (id),
	CONSTRAINT user_alert_user_fk FOREIGN KEY (user_id)
		REFERENCES solaruser.user_user (id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT user_alert_node_fk FOREIGN KEY (node_id)
		REFERENCES solarnet.sn_node (node_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

/* Add index on node_id so we can batch process in sets of nodes */
CREATE INDEX user_alert_node_idx ON solaruser.user_alert (node_id);

CREATE TABLE solaruser.user_alert_sit (
	id				BIGINT NOT NULL DEFAULT nextval('solaruser.user_alert_seq'),
	created			TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	alert_id		BIGINT NOT NULL,
	status			solaruser.user_alert_sit_status NOT NULL,
	notified		TIMESTAMP WITH TIME ZONE,
	CONSTRAINT user_alert_sit_pkey PRIMARY KEY (id),
	CONSTRAINT user_alert_sit_alert_fk FOREIGN KEY (alert_id)
		REFERENCES solaruser.user_alert (id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION solaruser.find_user_alerts_to_process(
	IN a_type solaruser.user_alert_type NOT NULL, 
	IN starting_id bigint, 
	IN max integer DEFAULT 50)
  RETURNS SETOF solaruser.user_alert AS
$BODY$
SELECT ual.* FROM solaruser.user_alert ual
WHERE 
	ual.alert_type = a_type
	AND ual.id > COALESCE(starting_id, -1)
ORDER BY ual.id
LIMIT max;
$BODY$
  LANGUAGE sql STABLE;
