import { Card, CardContent, CardHeader, CardActions, Typography } from "@mui/material";
import "./cardbase.css";

function CardBase({ title, subtitle, content, actions, className = "" }) {
  return (
    <Card className={`card-base ${className}`}>
      {title && (
        <CardHeader 
          title={title}
          subheader={subtitle}
          className="card-header"
        />
      )}
      <CardContent className="card-content">
        {typeof content === "string" ? (
          <Typography variant="body2">{content}</Typography>
        ) : (
          content
        )}
      </CardContent>
      {actions && <CardActions className="card-actions">{actions}</CardActions>}
    </Card>
  );
}

export default CardBase;