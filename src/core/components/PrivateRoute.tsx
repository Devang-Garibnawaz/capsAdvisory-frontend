import { Navigate, Route, RouteProps } from "react-router";
import { useAuth } from "../../auth/contexts/AuthProvider";
import { useEffect } from "react";

type PrivateRouteProps = {
  roles?: string[];
} & RouteProps;

const PrivateRoute = ({
  children,
  roles,
  ...routeProps
}: PrivateRouteProps) => {
  const { hasRole, userInfo } = useAuth();

  if (userInfo && localStorage.getItem('authkey')) {
    if (!hasRole(roles)) {
      return <Navigate to={`/${process.env.PUBLIC_URL}/403`} />;
    } else if(userInfo.role === 'user'){
      return <Navigate to={`/${process.env.PUBLIC_URL}/angel-broking-login`} />;
    }
    return <Route {...routeProps} />;
  } else {
    return <Navigate to={`/${process.env.PUBLIC_URL}`} />;
  }
};

export default PrivateRoute;
